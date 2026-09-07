# v0.3.0
# { "Depends": "py-genlayer:5jycge4q8k23462jtb0b9fyey1s9qz928sz2nbrd9mg4sxqg2qng" }

import genlayer as gl
from genlayer.types import *

class AgentPassport(gl.contract.Contract):
    agent_names: gl.storage.TreeMap[Address, str]
    reputation: gl.storage.TreeMap[Address, u256]
    successful_transactions: gl.storage.TreeMap[Address, u256]
    failed_transactions: gl.storage.TreeMap[Address, u256]
    disputes_won: gl.storage.TreeMap[Address, u256]
    disputes_lost: gl.storage.TreeMap[Address, u256]

    transaction_count: u256
    transaction_agent: gl.storage.TreeMap[u256, str]
    transaction_counterparty: gl.storage.TreeMap[u256, str]
    transaction_result: gl.storage.TreeMap[u256, str]

    dispute_count: u256
    dispute_accused: gl.storage.TreeMap[u256, str]
    dispute_challenger: gl.storage.TreeMap[u256, str]
    dispute_claim: gl.storage.TreeMap[u256, str]
    dispute_evidence: gl.storage.TreeMap[u256, str]
    dispute_status: gl.storage.TreeMap[u256, str]

    def __init__(self):
        self.transaction_count = 0
        self.dispute_count = 0

    @gl.public.write
    def register_agent(self, agent_address: str, agent_name: str) -> None:
        agent = Address(agent_address)
        if self.agent_names.get(agent, "") != "":
            return
        self.agent_names[agent] = agent_name
        self.reputation[agent] = 50
        self.successful_transactions[agent] = 0
        self.failed_transactions[agent] = 0
        self.disputes_won[agent] = 0
        self.disputes_lost[agent] = 0

    @gl.public.view
    def get_agent_name(self, agent_address: str) -> str:
        return self.agent_names.get(Address(agent_address), "")

    @gl.public.view
    def get_reputation(self, agent_address: str) -> u256:
        return self.reputation.get(Address(agent_address), 0)

    @gl.public.view
    def get_successful_transactions(self, agent_address: str) -> u256:
        return self.successful_transactions.get(Address(agent_address), 0)

    @gl.public.view
    def get_failed_transactions(self, agent_address: str) -> u256:
        return self.failed_transactions.get(Address(agent_address), 0)

    @gl.public.view
    def get_disputes_won(self, agent_address: str) -> u256:
        return self.disputes_won.get(Address(agent_address), 0)

    @gl.public.view
    def get_disputes_lost(self, agent_address: str) -> u256:
        return self.disputes_lost.get(Address(agent_address), 0)

    @gl.public.write
    def record_successful_transaction(self, agent_address: str, counterparty_address: str) -> u256:
        agent = Address(agent_address)
        counterparty = Address(counterparty_address)
        if self.agent_names.get(agent, "") == "":
            raise gl.vm.UserError("Agent is not registered")
        if self.agent_names.get(counterparty, "") == "":
            raise gl.vm.UserError("Counterparty is not registered")
        if agent == counterparty:
            raise gl.vm.UserError("Agent cannot transact with itself")
        self.transaction_count += 1
        transaction_id = self.transaction_count
        self.transaction_agent[transaction_id] = agent_address
        self.transaction_counterparty[transaction_id] = counterparty_address
        self.transaction_result[transaction_id] = "SUCCESS"
        current_successes = self.successful_transactions.get(agent, 0)
        self.successful_transactions[agent] = current_successes + 1
        current_reputation = self.reputation.get(agent, 0)
        if current_reputation <= 98:
            self.reputation[agent] = current_reputation + 2
        else:
            self.reputation[agent] = 100
        return transaction_id

    @gl.public.write
    def record_failed_transaction(self, agent_address: str, counterparty_address: str) -> u256:
        agent = Address(agent_address)
        counterparty = Address(counterparty_address)
        if self.agent_names.get(agent, "") == "":
            raise gl.vm.UserError("Agent is not registered")
        if self.agent_names.get(counterparty, "") == "":
            raise gl.vm.UserError("Counterparty is not registered")
        if agent == counterparty:
            raise gl.vm.UserError("Agent cannot transact with itself")
        self.transaction_count += 1
        transaction_id = self.transaction_count
        self.transaction_agent[transaction_id] = agent_address
        self.transaction_counterparty[transaction_id] = counterparty_address
        self.transaction_result[transaction_id] = "FAILED"
        current_failures = self.failed_transactions.get(agent, 0)
        self.failed_transactions[agent] = current_failures + 1
        current_reputation = self.reputation.get(agent, 0)
        if current_reputation >= 5:
            self.reputation[agent] = current_reputation - 5
        else:
            self.reputation[agent] = 0
        return transaction_id

    @gl.public.view
    def get_transaction(self, transaction_id: u256) -> str:
        agent = self.transaction_agent.get(transaction_id, "")
        counterparty = self.transaction_counterparty.get(transaction_id, "")
        result = self.transaction_result.get(transaction_id, "")
        if result == "":
            return "Transaction not found"
        return (
            "Agent: " + agent +
            " | Counterparty: " + counterparty +
            " | Result: " + result
        )

    @gl.public.write
    def create_dispute(self, accused_address: str, challenger_address: str, claim: str, evidence: str) -> u256:
        accused = Address(accused_address)
        challenger = Address(challenger_address)
        if self.agent_names.get(accused, "") == "":
            raise gl.vm.UserError("Accused agent is not registered")
        if self.agent_names.get(challenger, "") == "":
            raise gl.vm.UserError("Challenger is not registered")
        if accused == challenger:
            raise gl.vm.UserError("Agent cannot dispute itself")
        self.dispute_count += 1
        dispute_id = self.dispute_count
        self.dispute_accused[dispute_id] = accused_address
        self.dispute_challenger[dispute_id] = challenger_address
        self.dispute_claim[dispute_id] = claim
        self.dispute_evidence[dispute_id] = evidence
        self.dispute_status[dispute_id] = "PENDING"
        return dispute_id

    @gl.public.view
    def get_dispute(self, dispute_id: u256) -> str:
        status = self.dispute_status.get(dispute_id, "")
        if status == "":
            return "Dispute not found"
        accused = self.dispute_accused.get(dispute_id, "")
        challenger = self.dispute_challenger.get(dispute_id, "")
        claim = self.dispute_claim.get(dispute_id, "")
        evidence = self.dispute_evidence.get(dispute_id, "")
        return (
            "Accused: " + accused +
            " | Challenger: " + challenger +
            " | Claim: " + claim +
            " | Evidence: " + evidence +
            " | Status: " + status
        )

    @gl.public.write
    def adjudicate_dispute(self, dispute_id: u256) -> str:
        current_status = self.dispute_status.get(dispute_id, "")
        if current_status == "":
            raise gl.vm.UserError("Dispute does not exist")
        if current_status != "PENDING":
            return current_status

        claim = self.dispute_claim.get(dispute_id, "")
        evidence = self.dispute_evidence.get(dispute_id, "")
        accused_address = self.dispute_accused.get(dispute_id, "")
        accused = Address(accused_address)

        def judge_dispute() -> str:
            prompt = f"""
You are an impartial dispute adjudicator.

CLAIM:
{claim}

EVIDENCE:
{evidence}

Determine whether the evidence supports the claim.

If the evidence supports the claim, respond:

VALID

If the evidence contradicts or does not support the claim, respond:

INVALID

You must respond with ONLY one word:

VALID

or

INVALID
"""
            decision = gl.nondet.exec_prompt(prompt)
            return decision.strip().upper()

        decision = gl.eq_principle.strict_eq(judge_dispute)

        if decision != "VALID" and decision != "INVALID":
            raise gl.vm.UserError("Invalid adjudication response")

        self.dispute_status[dispute_id] = decision
        current_reputation = self.reputation.get(accused, 0)

        if decision == "VALID":
            current_wins = self.disputes_won.get(accused, 0)
            self.disputes_won[accused] = current_wins + 1
            if current_reputation <= 95:
                self.reputation[accused] = current_reputation + 5
            else:
                self.reputation[accused] = 100
        else:
            current_losses = self.disputes_lost.get(accused, 0)
            self.disputes_lost[accused] = current_losses + 1
            if current_reputation >= 10:
                self.reputation[accused] = current_reputation - 10
            else:
                self.reputation[accused] = 0

        return decision
