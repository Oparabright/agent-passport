"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import AgentPassport from "../contracts/AgentPassport";
import { getContractAddress, getStudioUrl } from "../genlayer/client";
import { useWallet } from "../genlayer/wallet";
import { configError } from "../utils/toast";

export function useAgentPassportContract(): AgentPassport | null {
  const { address } = useWallet();

  const contractAddress = getContractAddress();
  const studioUrl = getStudioUrl();

  const contract = useMemo(() => {
    if (!contractAddress) {
      configError(
        "Setup Required",
        "Contract address not configured. Please set NEXT_PUBLIC_CONTRACT_ADDRESS in your .env file."
      );

      return null;
    }

    return new AgentPassport(contractAddress, address, studioUrl);
  }, [contractAddress, address, studioUrl]);

  return contract;
}

export function useAgentPassport(agentAddress: string) {
  const contract = useAgentPassportContract();

  return useQuery({
    queryKey: ["agentPassport", agentAddress],

    queryFn: async () => {
      if (!contract) {
        return null;
      }

      const name = await contract.getAgentName(agentAddress);
      const reputation = await contract.getReputation(agentAddress);
      const successfulTransactions =
        await contract.getSuccessfulTransactions(agentAddress);
      const failedTransactions =
        await contract.getFailedTransactions(agentAddress);
      const disputesWon = await contract.getDisputesWon(agentAddress);
      const disputesLost = await contract.getDisputesLost(agentAddress);

      return {
        agentAddress,
        name,
        reputation,
        successfulTransactions,
        failedTransactions,
        disputesWon,
        disputesLost,
      };
    },

    enabled: !!contract && !!agentAddress,

    staleTime: 60_000,

    gcTime: 10 * 60_000,

    refetchOnWindowFocus: false,

    refetchOnReconnect: false,

    retry: 1,
  });
}

export function useTransaction(
  transactionId: number,
  enabled: boolean = true
) {
  const contract = useAgentPassportContract();

  return useQuery({
    queryKey: ["transaction", transactionId],

    queryFn: async () => {
      if (!contract) {
        return "";
      }

      return contract.getTransaction(transactionId);
    },

    enabled: !!contract && transactionId > 0 && enabled,

    staleTime: 5 * 60_000,

    gcTime: 30 * 60_000,

    refetchOnWindowFocus: false,

    refetchOnReconnect: false,

    retry: 1,
  });
}

export function useDispute(
  disputeId: number,
  enabled: boolean = true
) {
  const contract = useAgentPassportContract();

  return useQuery({
    queryKey: ["dispute", disputeId],

    queryFn: async () => {
      if (!contract) {
        return "";
      }

      return contract.getDispute(disputeId);
    },

    enabled: !!contract && disputeId > 0 && enabled,

    staleTime: 5 * 60_000,

    gcTime: 30 * 60_000,

    refetchOnWindowFocus: false,

    refetchOnReconnect: false,

    retry: 1,
  });
}