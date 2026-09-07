import { createClient } from "genlayer-js";
import { studioDevnet } from "genlayer-js/chains";
import { TransactionStatus } from "genlayer-js/types";

class AgentPassport {
  private contractAddress: `0x${string}`;
  private readClient: any;
  private writeClient: any | null = null;
  private studioUrl?: string;
  private account?: `0x${string}`;

  constructor(
    contractAddress: string,
    address?: string | null,
    studioUrl?: string
  ) {
    this.contractAddress = contractAddress as `0x${string}`;
    this.studioUrl = studioUrl;

    const readConfig: any = {
      chain: studioDevnet,
    };

    if (studioUrl) {
      readConfig.endpoint = studioUrl;
    }

    this.readClient = createClient(readConfig);

    if (
      typeof window !== "undefined" &&
      window.ethereum &&
      address
    ) {
      this.account = address as `0x${string}`;

      const writeConfig: any = {
        chain: studioDevnet,
        account: this.account,
        provider: window.ethereum,
      };

      if (studioUrl) {
        writeConfig.endpoint = studioUrl;
      }

      this.writeClient = createClient(writeConfig);
    }
  }

  async getAgentName(agentAddress: string): Promise<string> {
    const result = await this.readClient.readContract({
      address: this.contractAddress,
      functionName: "get_agent_name",
      args: [agentAddress],
    });

    return String(result);
  }

  async getReputation(agentAddress: string): Promise<number> {
    const result = await this.readClient.readContract({
      address: this.contractAddress,
      functionName: "get_reputation",
      args: [agentAddress],
    });

    return Number(result);
  }

  async getSuccessfulTransactions(
    agentAddress: string
  ): Promise<number> {
    const result = await this.readClient.readContract({
      address: this.contractAddress,
      functionName: "get_successful_transactions",
      args: [agentAddress],
    });

    return Number(result);
  }

  async getFailedTransactions(
    agentAddress: string
  ): Promise<number> {
    const result = await this.readClient.readContract({
      address: this.contractAddress,
      functionName: "get_failed_transactions",
      args: [agentAddress],
    });

    return Number(result);
  }

  async getDisputesWon(
    agentAddress: string
  ): Promise<number> {
    const result = await this.readClient.readContract({
      address: this.contractAddress,
      functionName: "get_disputes_won",
      args: [agentAddress],
    });

    return Number(result);
  }

  async getDisputesLost(
    agentAddress: string
  ): Promise<number> {
    const result = await this.readClient.readContract({
      address: this.contractAddress,
      functionName: "get_disputes_lost",
      args: [agentAddress],
    });

    return Number(result);
  }

  async getTransaction(
    transactionId: number
  ): Promise<string> {
    const result = await this.readClient.readContract({
      address: this.contractAddress,
      functionName: "get_transaction",
      args: [transactionId],
    });

    return String(result);
  }

  async getDispute(
    disputeId: number
  ): Promise<string> {
    const result = await this.readClient.readContract({
      address: this.contractAddress,
      functionName: "get_dispute",
      args: [disputeId],
    });

    return String(result);
  }

  private requireWriteClient() {
    if (!this.writeClient || !this.account) {
      throw new Error(
        "Wallet not connected. Please connect MetaMask before sending a transaction."
      );
    }

    return this.writeClient;
  }

  private async sendWrite(
    functionName: string,
    args: any[]
  ): Promise<string> {
    const client = this.requireWriteClient();

    const write = {
      address: this.contractAddress,
      functionName,
      args,
    };

    const estimatedFees =
      await client.estimateTransactionFeesForWrite(write);

    const txHash = await client.writeContract({
      ...write,
      fees: {
        distribution: estimatedFees.distribution,
        feeValue: estimatedFees.feeValue,
      },
    });

    return String(txHash);
  }

  async recordSuccessfulTransaction(
    agentAddress: string,
    counterpartyAddress: string
  ): Promise<string> {
    return this.sendWrite(
      "record_successful_transaction",
      [
        agentAddress,
        counterpartyAddress,
      ]
    );
  }

  async recordFailedTransaction(
    agentAddress: string,
    counterpartyAddress: string
  ): Promise<string> {
    return this.sendWrite(
      "record_failed_transaction",
      [
        agentAddress,
        counterpartyAddress,
      ]
    );
  }

  async createDispute(
    accusedAddress: string,
    challengerAddress: string,
    claim: string,
    evidence: string
  ): Promise<string> {
    return this.sendWrite(
      "create_dispute",
      [
        accusedAddress,
        challengerAddress,
        claim,
        evidence,
      ]
    );
  }

  async adjudicateDispute(
    disputeId: number
  ): Promise<string> {
    return this.sendWrite(
      "adjudicate_dispute",
      [disputeId]
    );
  }

  async waitForAcceptedTransaction(
    txHash: string
  ) {
    const receipt =
      await this.readClient.waitForTransactionReceipt({
        hash: txHash,
        status: TransactionStatus.ACCEPTED,
      });

    return receipt;
  }
}

export default AgentPassport;