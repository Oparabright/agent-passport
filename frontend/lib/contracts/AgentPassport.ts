import { createClient } from "genlayer-js";
import { studioDevnet } from "genlayer-js/chains";

class AgentPassport {
  private contractAddress: `0x${string}`;
  private client: any;
  private studioUrl?: string;

  constructor(
    contractAddress: string,
    address?: string | null,
    studioUrl?: string
  ) {
    this.contractAddress = contractAddress as `0x${string}`;
    this.studioUrl = studioUrl;

    const config: any = {
      chain: studioDevnet,
    };

    if (address) {
      config.account = address as `0x${string}`;
    }

    if (studioUrl) {
      config.endpoint = studioUrl;
    }

    this.client = createClient(config);
  }

  async getAgentName(agentAddress: string): Promise<string> {
    const result = await this.client.readContract({
      address: this.contractAddress,
      functionName: "get_agent_name",
      args: [agentAddress],
    });

    return String(result);
  }

  async getReputation(agentAddress: string): Promise<number> {
    const result = await this.client.readContract({
      address: this.contractAddress,
      functionName: "get_reputation",
      args: [agentAddress],
    });

    return Number(result);
  }

  async getSuccessfulTransactions(agentAddress: string): Promise<number> {
    const result = await this.client.readContract({
      address: this.contractAddress,
      functionName: "get_successful_transactions",
      args: [agentAddress],
    });

    return Number(result);
  }

  async getFailedTransactions(agentAddress: string): Promise<number> {
    const result = await this.client.readContract({
      address: this.contractAddress,
      functionName: "get_failed_transactions",
      args: [agentAddress],
    });

    return Number(result);
  }

  async getDisputesWon(agentAddress: string): Promise<number> {
    const result = await this.client.readContract({
      address: this.contractAddress,
      functionName: "get_disputes_won",
      args: [agentAddress],
    });

    return Number(result);
  }

  async getDisputesLost(agentAddress: string): Promise<number> {
    const result = await this.client.readContract({
      address: this.contractAddress,
      functionName: "get_disputes_lost",
      args: [agentAddress],
    });

    return Number(result);
  }

  async getTransaction(transactionId: number): Promise<string> {
    const result = await this.client.readContract({
      address: this.contractAddress,
      functionName: "get_transaction",
      args: [transactionId],
    });

    return String(result);
  }

  async getDispute(disputeId: number): Promise<string> {
    const result = await this.client.readContract({
      address: this.contractAddress,
      functionName: "get_dispute",
      args: [disputeId],
    });

    return String(result);
  }
}

export default AgentPassport;