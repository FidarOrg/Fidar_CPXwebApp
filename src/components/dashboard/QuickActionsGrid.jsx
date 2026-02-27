import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightLeft, faPlus } from "@fortawesome/free-solid-svg-icons";
import BeneficiaryForm from "./BeneficiaryForm";
import { useTranslation } from "react-i18next";
import { fidar } from "@/lib/fidar";
import { toast } from "@/hooks/use-toast";
import { handleFidarError } from "@/lib/handleFidarError";
import hottoast from "react-hot-toast";
import { initiateSign, transfer } from "@/api/transaction";
import { addBeneficiary, initiateBeneficiarySign } from "@/api/beneficiary";
import { handleSecurityError } from "@/lib/handleSecurityError";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { applyDemoTransfer } from "@/store/dashboardSlice";




export default function QuickActionsGrid({ handleAuthorizeDevice, refreshData }) {
  const [transferOpen, setTransferOpen] = useState(false);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [adding, setAdding] = useState(false);

  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingBeneficiary, setPendingBeneficiary] = useState(null);



  /* -----------------------------------------------
     Load Beneficiaries via fidar-sdk
  ------------------------------------------------*/
  useEffect(() => {
    const load = async () => {
      try {
        const list = await fidar.getBeneficiaries();
        setBeneficiaries(list);
      } catch (err) {
        console.error("Failed to load beneficiaries:", err);
        handleFidarError(err, t);
      }
    };
    load();
  }, []);

  /* -----------------------------------------------
     Add Beneficiary (requires passkey verification)
  ------------------------------------------------*/

  const handleAddRequest = async (payload) => {
    setAdding(true);
    setPendingBeneficiary(payload);
    setConfirmOpen(true);

    try {
      // 1️⃣ Get user
      const profile = await fidar.getMyProfile();
      const userId = profile["user-id"];

      hottoast.loading("Confirm with passkey…");

      // 2️⃣ INITIATE (WEB → BACKEND)
      const init = await initiateBeneficiarySign({ userId });
      const { txnId, challenge } = init;

      // 3️⃣ SIGN (SDK ONLY)
      const assertion = await fidar.signChallenge(challenge);
      const assertionJson = JSON.stringify(assertion);

      // 4️⃣ ADD BENEFICIARY (WEB → BACKEND)
      const newBen = await addBeneficiary({
        name: payload.name,
        iban: payload.iban,
        nickname: payload.nickname,
        accountNumber: payload.accountNumber,
        txnId,
        realm: "FIDAR_WEBAUTH_V2",
        userId,
        assertionJson,
      });

      hottoast.dismiss();

      setAddDialogOpen(false);
      // setBeneficiaries((prev) => [...prev, newBen]);

      // hottoast.success(
      //   `${newBen.name || newBen.nickname} added successfully!`
      // );
      hottoast.success(
        `${payload.name || payload.nickname} added successfully!`
      );

      refreshData?.();

    } catch (err) {
      hottoast.dismiss();

      // 🔐 GLOBAL IP RISK / VPN HANDLER
      if (
        handleSecurityError(err, {
          redirect: navigate,
          onBlocked: () => {
            setAddDialogOpen(false);
            setTransferOpen(false);
          },
        })
      ) {
        return;
      }


      // ❌ Other SDK / validation errors
      handleFidarError(err, t);
    } finally {
      setAdding(false);
    }

  };

  const confirmAddBeneficiary = async (payload) => {
    if (!payload) return;

    setAdding(true);
    hottoast.loading("Confirm with passkey…");

    try {
      // 1️⃣ Get user
      const profile = await fidar.getMyProfile();
      const userId = profile["user-id"];

      // 2️⃣ INITIATE (WEB → BACKEND)
      const init = await initiateBeneficiarySign({ userId });
      const { txnId, challenge } = init;

      // 3️⃣ SIGN (SDK ONLY)
      const assertion = await fidar.signChallenge(challenge);
      const assertionJson = JSON.stringify(assertion);

      // 4️⃣ ADD BENEFICIARY (WEB → BACKEND)
      const newBen = await addBeneficiary({
        name: payload.name,
        iban: payload.iban,
        nickname: payload.nickname,
        accountNumber: payload.accountNumber,
        txnId,
        realm: "FIDAR_WEBAUTH_V2",
        userId,
        assertionJson,
      });

      hottoast.dismiss();
      hottoast.success(
        `${payload.name || payload.nickname} added successfully!`
      );

      setConfirmOpen(false);
      setAddDialogOpen(false);
      setPendingBeneficiary(null);

      refreshData?.();

    } catch (err) {
      hottoast.dismiss();

      if (
        handleSecurityError(err, {
          redirect: navigate,
          onBlocked: () => {
            setConfirmOpen(false);
            setAddDialogOpen(false);
            setTransferOpen(false);
          },
        })
      ) {
        return;
      }

      handleFidarError(err, t);
    } finally {
      setAdding(false);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* ADD BENEFICIARY */}
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => setAddDialogOpen(true)}
              className="
                h-16 lg:h-20 flex flex-col items-center justify-center gap-1.5
                bg-white border border-pink-300 text-pink-600 rounded-2xl shadow-lg
                transition-all duration-300
                hover:bg-pink-50 hover:shadow-xl hover:-translate-y-1 active:translate-y-0
              "
            >
              <FontAwesomeIcon icon={faPlus} className="h-5 w-5" />{" "}
              {t("actions.addBeneficiary")}
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t("actions.addBeneficiary")}</DialogTitle>
            </DialogHeader>

            <BeneficiaryForm onAdd={handleAddRequest} submitting={adding} />
          </DialogContent>
        </Dialog>
        <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <DialogContent className="sm:max-w-lg rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-foreground">
                Confirm Beneficiary Addition
              </DialogTitle>
            </DialogHeader>

            <div className="mt-4 space-y-4">
              <p className="text-base text-muted-foreground">
                Please confirm the addition of
              </p>

              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <p className="text-lg font-semibold text-foreground">
                  {pendingBeneficiary?.name || pendingBeneficiary?.nickname}
                </p>
                {pendingBeneficiary?.iban && (
                  <p className="text-sm text-muted-foreground mt-1">
                    IBAN: {pendingBeneficiary.iban}
                  </p>
                )}
                {pendingBeneficiary?.accountNumber && (
                  <p className="text-sm text-muted-foreground">
                    Account: {pendingBeneficiary.accountNumber}
                  </p>
                )}
              </div>

              <p className="text-sm text-muted-foreground">
                Once added, this beneficiary will be available for transfers.
              </p>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setConfirmOpen(false);
                  setPendingBeneficiary(null);
                }}
              >
                Cancel
              </Button>

              <Button
                onClick={async () => {
                  setConfirmOpen(false);
                  await confirmAddBeneficiary(pendingBeneficiary);
                }}
                className="bg-pink-600 hover:bg-pink-700 text-white"
              >
                Confirm & Add
              </Button>
            </div>
          </DialogContent>
        </Dialog>


        {/* TRANSFER */}
        <Dialog open={transferOpen} onOpenChange={setTransferOpen}>
          <DialogTrigger asChild onClick={() => setTransferOpen(true)}>
            <Button
              className="
                h-16 lg:h-20 flex flex-col items-center justify-center gap-1.5
                bg-white border border-pink-300 text-pink-600 rounded-2xl shadow-lg
                transition-all duration-300
                hover:bg-pink-50 hover:shadow-xl hover:-translate-y-1 active:translate-y-0
              "
            >
              <FontAwesomeIcon icon={faRightLeft} className="h-5 w-5" />{" "}
              {t("actions.transfer")}
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-md bg-card border border-border rounded-xl shadow-xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-foreground tracking-tight">
                Transfer Money
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                Select a beneficiary and enter transfer details.
              </p>
            </DialogHeader>

            {beneficiaries.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground text-sm">
                You have no beneficiaries added.
              </div>
            ) : (
              <TransferForm
                beneficiaries={beneficiaries}
                refreshData={refreshData}
                closeDialog={() => setTransferOpen(false)}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* AUTHORIZE DEVICE BUTTON */}
        <button
          className="h-12 w-full flex items-center justify-center gap-[6px]
            bg-gradient-to-r from-blue-800 to-indigo-800 
            hover:from-blue-700 hover:to-indigo-700 text-white font-semibold
            shadow-lg hover:shadow-[0_0_20px_rgba(79,70,229,0.6)]
            transition-all duration-300 rounded-lg ring-1 ring-white/10 
            hover:scale-[1.02] active:scale-95"
          onClick={handleAuthorizeDevice}
        >
          <span className="text-center w-full">
            {t("dashboard.authorizeDevice")}
          </span>
        </button>

        {/* VIEW BENEFICIARIES BUTTON */}
        <Dialog>
          <DialogTrigger asChild>
            <button
              className="h-12 w-full flex items-center justify-center gap-[6px]
                bg-white border border-blue-300 text-blue-700 font-semibold
                shadow-lg hover:bg-blue-50 hover:shadow-xl transition-all duration-300 
                rounded-lg hover:-translate-y-1 active:translate-y-0"
            >
              <span className="text-center w-full">View Beneficiaries</span>
            </button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-lg bg-card border border-border rounded-xl shadow-xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-foreground tracking-tight">
                Beneficiaries
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                Saved recipients linked to your wallet.
              </p>
            </DialogHeader>

            {beneficiaries.length === 0 ? (
              <div className="py-10 text-center text-muted-foreground text-sm">
                No beneficiaries available.
              </div>
            ) : (
              <div className="mt-4 max-h-80 overflow-y-auto pr-1 space-y-3">
                {beneficiaries.map((b) => (
                  <div
                    key={b.id}
                    className="rounded-xl border border-border bg-muted/30 dark:bg-muted/20 
                              p-4 flex flex-col gap-1 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-foreground text-base">
                        {b.nickname}
                      </h3>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full 
                                      bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100"
                      >
                        {b.active ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      Full Name:{" "}
                      <span className="text-foreground">{b.name}</span>
                    </p>

                    <p className="text-sm text-muted-foreground">
                      IBAN:{" "}
                      <span className="font-medium text-foreground">
                        {b.iban}
                      </span>
                    </p>

                    <p className="text-sm text-muted-foreground">
                      Account:{" "}
                      <span className="font-medium text-foreground">
                        {b.accountNumber}
                      </span>
                    </p>
                  </div>
                ))}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}

/* -----------------------------------------
   TransferForm (passkey required before transfer)
------------------------------------------- */
function TransferForm({ beneficiaries, refreshData, closeDialog }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // 🔹 Form state
  const [selected, setSelected] = useState("");
  const [amount, setAmount] = useState("");
  const [purpose, setPurpose] = useState("");

  // 🔹 Wallet balance
  const [balance, setBalance] = useState(0);
  const [loadingBalance, setLoadingBalance] = useState(true);

  // 🔹 Load wallet balance using SAME API
  useEffect(() => {
    const loadWalletBalance = async () => {
      try {
        const walletData = await fidar.getWallets();
        console.log("Wallet API response:", walletData);

        const walletBalance = Number(walletData?.amount ?? 0);
        setBalance(walletBalance);
      } catch (err) {
        console.error("Failed to fetch wallet balance", err);
      } finally {
        setLoadingBalance(false);
      }
    };

    loadWalletBalance();
  }, []);

  // 🔹 Transfer handler
  const handleVerifyThenTransfer = async () => {
    const numericAmount = Number(amount);

    // 1️⃣ Required fields
    if (!selected || !purpose) {
      hottoast.error("All fields are required");
      return;
    }

    // 2️⃣ Missing amount
    if (amount === "") {
      hottoast.error("Please enter an amount");
      return;
    }

    // 3️⃣ Invalid amount
    if (isNaN(numericAmount) || numericAmount <= 0) {
      hottoast.error("Amount must be greater than 0 ");
      return;
    }

    // 4️⃣ Insufficient balance
    if (numericAmount > balance) {
      hottoast.error(`Insufficient balance. Available: ${balance}`);
      return;
    }

    try {
      hottoast.loading("Confirm with passkey…");

      // 🔹 Get user profile
      const profile = await fidar.getMyProfile();
      const userId = profile["user-id"];

      // 🔹 Initiate transfer
       const init = await initiateSign({
         userId,
         amount: numericAmount,
         toAccount: selected,
         remark: purpose,
       });

      const { txnId, challenge } = init;

      // 🔹 Sign challenge
       const assertion = await fidar.signChallenge(challenge);
       const assertionJson = JSON.stringify(assertion);

      //  🔹 Execute transfer
       await transfer({
         targetId: selected,
         amount: numericAmount,
         purpose,
         txnId,
         realm: "FIDAR_WEBAUTH_V2",
         userId,
         assertionJson,
       });

      dispatch(
        applyDemoTransfer({
          amount: numericAmount,
          toAccount: "Anis",
        })
      );

      hottoast.dismiss();
      hottoast.success(`Transfer successful — ${numericAmount}`);

      closeDialog?.();
      refreshData?.();
    } catch (err) {
      hottoast.dismiss();

      if (
        handleSecurityError(err, {
          redirect: navigate,
          onBlocked: () => {
            closeDialog?.();
          },
        })
      ) {
        return;
      }

      handleFidarError(err, t);
    }
  };


  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <label className="text-sm font-medium text-foreground">
          Select Beneficiary
        </label>
        <select
          className="w-full p-2.5 rounded-lg border border-border bg-background text-foreground"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
        >
          <option value="">-- Select --</option>
          {beneficiaries
            .map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.nickname})
              </option>
            ))}
        </select>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-foreground">Amount</label>
        <input
          type="number"
          className="w-full p-2.5 rounded-lg border border-border bg-background text-foreground"
          placeholder="Enter amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-foreground">Purpose</label>
        <input
          type="text"
          className="w-full p-2.5 rounded-lg border border-border bg-background text-foreground"
          placeholder="Enter purpose"
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
        />
      </div>

      <Button onClick={handleVerifyThenTransfer} className="w-full">
        Send Money
      </Button>
    </div>
  );
}
