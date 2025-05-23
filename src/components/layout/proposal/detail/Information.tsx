"use client";
// import { DAOABI, DAOToken } from "@/config/DAO";
import Image from "next/image";
import React from "react";
// import { useReadContract } from "wagmi";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import useGetDetailProposals from "@/hooks/getDetailProposal";
import useGetProfileUser from "@/hooks/getProfileUser";
export default function Information({ index }: { index: number }) {
  const { proposal, isLoading } = useGetDetailProposals(index);
  const { profile } = useGetProfileUser({
    userAddress: proposal?.proposer,
  });
  // const [index, setIndex] = React.useState<number | null>(null);

  // React.useEffect(() => {
  //   if (proposals && proposals.length > 0) {
  //     setIndex(proposals.length - 1);
  //   }
  // }, [proposals]);

  // const {
  //   data: totalDonations,
  //   isLoading: loadingTotalDonations,
  //   refetch,
  // } = useReadContract({
  //   abi: DAOABI,
  //   address: DAOToken,
  //   functionName: "getTotalDonations",
  //   args: [index],
  // });

  // React.useEffect(() => {
  //   refetch();
  // }, [refetch]);

  return (
    <section>
      {isLoading && <p>Loading...</p>}
      <div className="flex items-start gap-5">
        <Image
          src={proposal?.image || "/placeholder.jpg"}
          alt="Proposal Image "
          width={100}
          height={100}
          className="rounded-md object-cover mb-3 aspect-square bg-secondary"
        />
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">{proposal?.title}</h1>
          <div className="">
            <p className="text-sm text-muted-foreground">Creator/Builder</p>
            <div className="flex items-center gap-2">
              <Avatar>
                <AvatarImage src={profile?.image_url} />
                <AvatarFallback>{profile?.username.slice(0, 2)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">@{profile?.username}</p>
                <p className="text-xs">
                  {proposal?.proposer.slice(0, 5)}...
                  {proposal?.proposer.slice(-5)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
