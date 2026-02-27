"use client";
// Inspired by react-hot-toast + shadcn pattern (Radix Toast under the hood)
import * as React from "react";

const TOAST_LIMIT = 3;
const DEFAULT_DURATION = 5000;
const CLOSE_ANIMATION_MS = 200; // time to allow exit animation

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
};

let count = 0;
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

// Timers for auto-dismiss and remove-after-close
const dismissTimeouts = new Map();
const removeTimeouts = new Map();

function scheduleDismiss(id, duration) {
  if (dismissTimeouts.has(id)) {
    clearTimeout(dismissTimeouts.get(id));
  }
  if (duration === Infinity) return; // persistent toast
  const t = setTimeout(() => {
    dispatch({ type: actionTypes.DISMISS_TOAST, toastId: id });
    scheduleRemove(id, CLOSE_ANIMATION_MS);
  }, Math.max(0, duration ?? DEFAULT_DURATION));
  dismissTimeouts.set(id, t);
}

function scheduleRemove(id, delay) {
  if (removeTimeouts.has(id)) {
    clearTimeout(removeTimeouts.get(id));
  }
  const t = setTimeout(() => {
    removeTimeouts.delete(id);
    dispatch({ type: actionTypes.REMOVE_TOAST, toastId: id });
  }, Math.max(0, delay));
  removeTimeouts.set(id, t);
}

export const reducer = (state, action) => {
  switch (action.type) {
    case actionTypes.ADD_TOAST:
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };

    case actionTypes.UPDATE_TOAST:
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      };

    case actionTypes.DISMISS_TOAST: {
      const { toastId } = action;
      const targetIds = toastId
        ? [toastId]
        : state.toasts.map((t) => t.id);

      // Cancel any pending dismiss timers; schedule removal after close anim
      targetIds.forEach((id) => {
        if (dismissTimeouts.has(id)) {
          clearTimeout(dismissTimeouts.get(id));
          dismissTimeouts.delete(id);
        }
        scheduleRemove(id, CLOSE_ANIMATION_MS);
      });

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          targetIds.includes(t.id) ? { ...t, open: false } : t
        ),
      };
    }

    case actionTypes.REMOVE_TOAST:
      if (action.toastId === undefined) {
        // remove all (rarely used)
        return { ...state, toasts: [] };
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      };

    default:
      return state;
  }
};

const listeners = [];
let memoryState = { toasts: [] };

function dispatch(action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}

function toast(props) {
  const id = genId();
  const { duration = DEFAULT_DURATION } = props ?? {};

  const update = (next) =>
    dispatch({
      type: actionTypes.UPDATE_TOAST,
      toast: { ...next, id },
    });

  const dismiss = () =>
    dispatch({ type: actionTypes.DISMISS_TOAST, toastId: id });

  dispatch({
    type: actionTypes.ADD_TOAST,
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss();
      },
    },
  });

  // Schedule auto-dismiss per toast
  scheduleDismiss(id, duration);

  return { id, dismiss, update };
}

function useToast() {
  const [state, setState] = React.useState(memoryState);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) listeners.splice(index, 1);
    };
  }, []);

  return {
    ...state,
    toast,
    dismiss: (toastId) => dispatch({ type: actionTypes.DISMISS_TOAST, toastId }),
  };
}

export { useToast, toast };
