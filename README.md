# Agent Passport

**A verifiable reputation and trust layer for autonomous AI agents,
powered by GenLayer Intelligent Contracts.**

Agent Passport gives AI agents an on-chain identity, records successful
and failed interactions, allows counterparties to challenge questionable
behavior, and uses GenLayer intelligent consensus to adjudicate disputes
and update reputation.

> **MVP status:** Working end-to-end on GenLayer Studio Next, including
> wallet-triggered writes, reputation updates, dispute creation, and
> AI-assisted dispute adjudication.

## Why Agent Passport?

Autonomous agents increasingly transact, collaborate, and make decisions
for users. But an agent address alone does not tell another agent
whether it has behaved reliably in the past.

Agent Passport provides a reusable trust primitive:

-   **Agent Passport** --- register an agent address with an on-chain
    identity.
-   **Reputation Score** --- each registered agent starts at 50/100.
-   **Behavior History** --- successful and failed interactions affect
    reputation.
-   **Disputes** --- registered agents can challenge another registered
    agent with a claim and evidence.
-   **Intelligent Adjudication** --- GenLayer evaluates the claim and
    evidence through an LLM-backed nondeterministic operation and
    consensus.
-   **Automatic Consequences** --- the agreed dispute result updates the
    accused agent's reputation and dispute record.

## Demo

The current demo uses three agents:

  -----------------------------------------------------------------------
  Agent                   Role                    Demo behavior
  ----------------------- ----------------------- -----------------------
  **ResearchBot**         Research Agent          Builds reputation
                                                  through successful
                                                  interactions

  **VerifierBot**         Verification Agent      Acts as counterparty
                                                  and dispute challenger

  **ScamBot**             Flagged Agent           Demonstrates failed
                                                  interactions and
                                                  disputed claims
  -----------------------------------------------------------------------

### End-to-end flow

1.  Connect a wallet to the frontend.
2.  Record a successful `ResearchBot -> VerifierBot` interaction.
3.  ResearchBot's successful transaction count increases and reputation
    gains **+2**.
4.  Record a failed `ScamBot -> VerifierBot` interaction.
5.  ScamBot's failed transaction count increases and reputation loses
    **-5**.
6.  Create a dispute against ScamBot using VerifierBot as challenger.
7.  Submit the dispute for GenLayer intelligent adjudication.
8.  GenLayer evaluates the natural-language claim and evidence.
9.  The agreed `VALID` or `INVALID` result is stored on-chain.
10. Reputation and dispute statistics update automatically.

In the tested demo, the claim `This seller is legitimate.` was
challenged with evidence describing failed transactions and no
successful transactions. GenLayer adjudication returned **INVALID**, and
the accused agent's reputation was automatically reduced.

## How GenLayer Is Used

Agent Passport is not using GenLayer only as a database.

The core adjudication function performs an LLM call through
`gl.nondet.exec_prompt()` and passes the nondeterministic operation
through `gl.eq_principle.strict_eq()`. After an agreed `VALID` or
`INVALID` result is returned, deterministic contract code stores the
outcome and applies the reputation change.

This separation is important: the AI judgment occurs inside GenLayer's
nondeterministic execution model, while the reputation update occurs
deterministically after consensus.

## Reputation Rules

  Event                                 Reputation effect
  ----------------------------------- -------------------
  Agent registration                     Starts at **50**
  Successful interaction                           **+2**
  Failed interaction                               **-5**
  Valid dispute for accused agent                  **+5**
  Invalid dispute for accused agent               **-10**

Reputation is bounded between **0 and 100**.

## Architecture

``` text
Next.js Agent Passport Dashboard
              |
              | genlayer-js
              v
AgentPassport Intelligent Contract
  - Agent identities
  - Reputation
  - Transaction history
  - Dispute records
              |
              | claim + evidence
              v
GenLayer / GenVM
  gl.nondet.exec_prompt()
              +
  gl.eq_principle.strict_eq()
              |
              | VALID / INVALID
              v
Deterministic State Update
  - Store dispute result
  - Update reputation
  - Update dispute counters
```

## Deployed Demo

The current MVP was deployed and tested on **GenLayer Studio Next**.

  Item              Value
  ----------------- ----------------------------------------------
  Network           GenLayer Studio Next
  Chain ID          `61997`
  Contract          `0xcD853F7772B7E58342cC52ce96EAa75355f4D841`
  Contract source   `contracts/agent_passport.py`

### Demo agent addresses

``` text
ResearchBot
0x6909892961bF4A4E3f69E750b9a18196DaAe489d

VerifierBot
0x1f400f22878fBBcc8090BB60d906b9Df779edB84

ScamBot
0x437e1D8dB8E448BbF00cbBE0795d13F70DF73Ac8
```

## Tech Stack

-   **GenLayer Intelligent Contracts**
-   **Python / GenVM**
-   **GenLayerJS**
-   **Next.js**
-   **React**
-   **TypeScript**
-   **TanStack Query**
-   **Tailwind CSS**
-   **MetaMask**

The frontend was built from the official GenLayer project boilerplate
and adapted into the Agent Passport application.

## Project Structure

``` text
contracts/
  agent_passport.py          # Agent Passport Intelligent Contract

frontend/
  app/
    page.tsx                 # Main Agent Passport dashboard
  lib/
    contracts/
      AgentPassport.ts       # Contract read/write wrapper
    hooks/
      useAgentPassport.ts    # React Query read/write hooks
    genlayer/
      client.ts              # Studio Next client/network configuration
      wallet.ts              # Wallet integration

README.md
```

Some original boilerplate files may remain in the repository during MVP
cleanup; the Agent Passport application uses the files identified above.

## Run the Frontend Locally

### 1. Install dependencies

From the repository root:

``` bash
cd frontend
npm install
```

### 2. Configure environment variables

Create `frontend/.env`:

``` env
NEXT_PUBLIC_GENLAYER_RPC_URL=https://studio-next.genlayer.com/api
NEXT_PUBLIC_GENLAYER_CHAIN_ID=61997
NEXT_PUBLIC_GENLAYER_CHAIN_NAME=GenLayer Studio Next
NEXT_PUBLIC_GENLAYER_SYMBOL=GEN
NEXT_PUBLIC_CONTRACT_ADDRESS=0xcD853F7772B7E58342cC52ce96EAa75355f4D841
```

Do not commit private environment files or wallet secrets.

### 3. Start the frontend

``` bash
npm run dev
```

Then open `http://localhost:3000` and connect MetaMask when you want to
perform write actions.

## Intelligent Contract

The deployed contract source is:

``` text
contracts/agent_passport.py
```

The contract supports registration, successful/failed interaction
recording, dispute creation, intelligent adjudication, and read-only
passport/history queries.

## MVP Security Scope

Agent Passport is currently a hackathon MVP and should not be
interpreted as a production-ready identity/authentication protocol.

The current contract validates that participating addresses are
registered and prevents an agent from interacting with or disputing
itself. However, it does **not yet authenticate ownership of an agent
address for every reputation-changing action**.

A production version should add:

-   authenticated agent ownership;
-   signed interaction receipts;
-   counterparty confirmation;
-   replay/spam protections;
-   stronger Sybil and reputation-farming resistance;
-   configurable dispute policies and richer evidence validation.

This limitation is intentionally documented rather than presenting the
MVP as a complete anti-fraud system.

## Roadmap

-   Cryptographically authenticated agent ownership
-   Signed bilateral interaction receipts
-   Portable reputation across agent marketplaces
-   Category-specific reputation scores
-   Richer dispute evidence
-   Agent-to-agent trust queries
-   Reputation decay and confidence weighting
-   Production/testnet deployment beyond the Studio development
    environment

## Built With GenLayer

GenLayer enables contracts to reach consensus over nondeterministic
inputs such as LLM outputs and live web data. Agent Passport applies
that capability to a fundamental problem in the agentic economy:

**Can one autonomous agent trust another?**

Instead of relying entirely on a centralized reputation administrator,
Agent Passport turns behavioral history and contested claims into
verifiable on-chain reputation signals.

## License

This repository retains the license included with the GenLayer project
boilerplate.
