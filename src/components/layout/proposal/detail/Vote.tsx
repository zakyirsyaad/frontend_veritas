import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DAOABI, DAOToken, IDRXABI, IDRXToken } from "@/config/DAO";
import { LoaderCircle, Wallet } from "lucide-react";
import Link from "next/link";
import React from "react";
import { formatUnits, parseUnits } from "viem";
import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";

export default function Vote({ index }: { index: number }) {
  const { address } = useAccount();
  const [amount, setAmount] = React.useState<string>("");
  const [vote, setVote] = React.useState<boolean | null>(null);

  const { data: voted, refetch } = useReadContract({
    abi: DAOABI,
    address: DAOToken,
    functionName: "hasVoted",
    args: [index, address],
  });

  React.useEffect(() => {
    refetch();
  }, [refetch]);

  async function chooseVote(vote: boolean) {
    setVote(vote);
  }

  const {
    data: hash,
    writeContractAsync,
    isPending,
    isError,
    isSuccess,
    failureReason,
  } = useWriteContract();

  const {
    isLoading: confirming,
    isSuccess: confirmed,
    isError: isReceiptError,
    failureReason: receiptFailureReason,
  } = useWaitForTransactionReceipt({
    hash: hash,
  });

  async function sendDonation() {
    try {
      await writeContractAsync({
        abi: IDRXABI,
        address: IDRXToken,
        functionName: "approve",
        args: [DAOToken, parseUnits(amount || "0", 2)],
      });
      await writeContractAsync({
        abi: DAOABI,
        address: DAOToken,
        functionName: "vote",
        args: [index, vote, parseUnits(amount || "0", 2)],
      });
    } catch (error) {
      console.error("Error sending donation:", error);
    }
  }

  const { data: balanceIDRX } = useReadContract({
    abi: IDRXABI,
    address: IDRXToken,
    functionName: "balanceOf",
    args: [address],
  });
  return (
    <div className="border p-5 rounded-md space-y-3">
      <div className="grid grid-cols-2 gap-5">
        <Button
          variant={vote === true ? "default" : "outline"}
          onClick={() => chooseVote(true)}
        >
          Setuju
        </Button>
        <Button
          variant={vote === false ? "default" : "outline"}
          onClick={() => chooseVote(false)}
        >
          Tidak Setuju
        </Button>
      </div>
      <div className="flex justify-between">
        <p>Jumlah (IDRX)</p>
        {balanceIDRX ? (
          <p className="text-muted-foreground flex gap-1">
            <Wallet strokeWidth={1} />
            <span className="font-bold">
              {formatUnits(BigInt(balanceIDRX as bigint), 2)}
            </span>{" "}
            IDRX
          </p>
        ) : (
          <p className="text-muted-foreground flex gap-1">
            <Wallet /> 0 IDRX
          </p>
        )}
      </div>
      <div>
        <Input
          placeholder="Contoh: 10000"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <p className="text-sm text-muted-foreground mt-2 font-medium">
          1 IDRX = 1 Suara
        </p>
      </div>
      <Button
        onClick={sendDonation}
        disabled={
          isPending || confirming || confirmed || !amount || Boolean(voted)
        }
      >
        {isPending || confirming ? (
          <p className="flex gap-1">
            Mengkonfirmasi <LoaderCircle className="animate-spin" />
          </p>
        ) : (
          "Konfirmasi Vote"
        )}
      </Button>

      <div className="max-w-5xl mx-auto text-center">
        {confirming && <p>Mengkonfirmasi transasi...</p>}
        {confirmed && <p>Transaksi disetujui!</p>}
        {isError && <p>Error: {failureReason?.toString()}</p>}
        {isReceiptError && <p>Error: {receiptFailureReason?.toString()}</p>}
        {isSuccess && confirmed && <p>Transaksi telah dikonfimasi!</p>}
        {isSuccess && !confirming && (
          <div>
            <Link
              href={`https://sepolia-blockscout.lisk.com/tx/${hash}`}
              target="_blank"
            >
              <Button variant={"outline"}>Lihat Detail Transaksi</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
