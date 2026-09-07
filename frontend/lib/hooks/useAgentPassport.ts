"use client";

import { useMemo } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import AgentPassport from "../contracts/AgentPassport";
import {
  getContractAddress,
  getStudioUrl,
} from "../genlayer/client";
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

    return new AgentPassport(
      contractAddress,
      address,
      studioUrl
    );
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

      const disputesWon =
        await contract.getDisputesWon(agentAddress);

      const disputesLost =
        await contract.getDisputesLost(agentAddress);

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

    enabled:
      !!contract &&
      transactionId > 0 &&
      enabled,

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

    enabled:
      !!contract &&
      disputeId > 0 &&
      enabled,

    staleTime: 5 * 60_000,

    gcTime: 30 * 60_000,

    refetchOnWindowFocus: false,

    refetchOnReconnect: false,

    retry: 1,
  });
}

/*
|--------------------------------------------------------------------------
| WRITE: SUCCESSFUL TRANSACTION
|--------------------------------------------------------------------------
*/

export function useRecordSuccessfulTransaction() {
  const contract = useAgentPassportContract();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      agentAddress,
      counterpartyAddress,
    }: {
      agentAddress: string;
      counterpartyAddress: string;
    }) => {
      if (!contract) {
        throw new Error("Agent Passport contract is not available.");
      }

      const txHash =
        await contract.recordSuccessfulTransaction(
          agentAddress,
          counterpartyAddress
        );

      await contract.waitForAcceptedTransaction(txHash);

      return txHash;
    },

    onSuccess: async (
      _txHash,
      variables
    ) => {
      await queryClient.invalidateQueries({
        queryKey: [
          "agentPassport",
          variables.agentAddress,
        ],
      });

      await queryClient.invalidateQueries({
        queryKey: ["transaction"],
      });
    },
  });
}

/*
|--------------------------------------------------------------------------
| WRITE: FAILED TRANSACTION
|--------------------------------------------------------------------------
*/

export function useRecordFailedTransaction() {
  const contract = useAgentPassportContract();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      agentAddress,
      counterpartyAddress,
    }: {
      agentAddress: string;
      counterpartyAddress: string;
    }) => {
      if (!contract) {
        throw new Error("Agent Passport contract is not available.");
      }

      const txHash =
        await contract.recordFailedTransaction(
          agentAddress,
          counterpartyAddress
        );

      await contract.waitForAcceptedTransaction(txHash);

      return txHash;
    },

    onSuccess: async (
      _txHash,
      variables
    ) => {
      await queryClient.invalidateQueries({
        queryKey: [
          "agentPassport",
          variables.agentAddress,
        ],
      });

      await queryClient.invalidateQueries({
        queryKey: ["transaction"],
      });
    },
  });
}

/*
|--------------------------------------------------------------------------
| WRITE: CREATE DISPUTE
|--------------------------------------------------------------------------
*/

export function useCreateDispute() {
  const contract = useAgentPassportContract();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      accusedAddress,
      challengerAddress,
      claim,
      evidence,
    }: {
      accusedAddress: string;
      challengerAddress: string;
      claim: string;
      evidence: string;
    }) => {
      if (!contract) {
        throw new Error("Agent Passport contract is not available.");
      }

      const txHash = await contract.createDispute(
        accusedAddress,
        challengerAddress,
        claim,
        evidence
      );

      await contract.waitForAcceptedTransaction(txHash);

      return txHash;
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["dispute"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["agentPassport"],
      });
    },
  });
}

/*
|--------------------------------------------------------------------------
| WRITE: ADJUDICATE DISPUTE
|--------------------------------------------------------------------------
*/

export function useAdjudicateDispute() {
  const contract = useAgentPassportContract();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      disputeId,
    }: {
      disputeId: number;
    }) => {
      if (!contract) {
        throw new Error("Agent Passport contract is not available.");
      }

      const txHash =
        await contract.adjudicateDispute(disputeId);

      await contract.waitForAcceptedTransaction(txHash);

      return txHash;
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["dispute"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["agentPassport"],
      });
    },
  });
}