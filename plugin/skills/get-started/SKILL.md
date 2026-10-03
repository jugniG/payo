---
name: payo-getting-started
description: Explains how to order groceries through Payo from ChatGPT — connecting the account, adding a delivery address, funding the wallet, and placing a first order. Use when the user asks how to start, what Payo can do, or when an order fails because an address or balance is missing.
---

# Getting started with Payo

Payo lets you order from Blinkit and Zepto without opening a shopping app. You ask in
plain language; Payo searches the catalogue, builds the cart, completes checkout on the
platform, and returns a confirmation.

## Before the first order

Three things must be in place. If any is missing, the tool that needs it will return an
actionable error rather than failing silently.

1. **A saved delivery address.** Addresses are created in the Payo dashboard under
   Settings → Delivery Addresses, never in chat. Call `list_addresses` to see what exists.
   The coordinates matter: quick-commerce stock depends on which dark store serves that
   exact location, so an imprecise pin returns an empty or misleading catalogue.

2. **A funded wallet.** Payo keeps a prepaid balance that agents spend from. Call
   `get_wallet_balance` to check it. Top up from the dashboard if it is short.

3. **Platform knowledge.** A platform is part of the product's internal record, not a
   product attribute. There is no rule that the platform serving the cheapest item is the
   one to order from — pick what suits the order. Do not switch platform to avoid a price
   comparison; switching changes availability and delivery time.

## Placing an order

```
User: "order me a pack of Amul Gold Milk"
```

1. `search_products` — pass `query` and an `address_id` from `list_addresses`. Returns
   matching items with `id`, `name`, `price_inr`, and `platform`. **Record the `id` and
   `platform` verbatim.** Both are needed for the next call and neither can be guessed.
2. Confirm the variant with the user if there is a real choice (size, flavour, pack count).
   Do not silently pick the cheapest or the first.
3. `initiate_order` — pass the `product_id`, `product_name`, `platform`, `address_id`, and
   `payment_method`. Price is re-verified server-side; the agent's view of the price is
   never trusted for the charge.
4. `confirm_order` — only for `payment_method: "wallet"`, and only when the user supplies
   the 6-digit OTP from their bank SMS. Cash-on-delivery orders are already complete when
   `initiate_order` returns.

## Payment

| Method | What happens |
|---|---|
| `cod` | Order is placed, user pays the rider in cash. A service fee still leaves the Payo wallet. **Not available on Zepto.** |
| `wallet` | Order is placed, the platform sends an OTP, `confirm_order` completes it and debits the wallet. |

Never guess, invent, or ask the user to relay an OTP they have not actually received.

## Common failures

| Message | Cause |
|---|---|
| `No delivery addresses saved yet` | User must add one in the dashboard. |
| `Insufficient wallet balance` | Top up, then retry. |
| `COD is not available on Zepto` | Choose Blinkit for COD, or use wallet on Zepto. |
| `Could not verify price` | Platform outage or a catalogue change. Retry shortly; do not retry repeatedly. |
| `unauthorized` | The plugin's session expired. Ask the user to reconnect Payo in settings. |

## Scope

Payo orders groceries and household goods from Blinkit and Zepto in India. It does not
search other retailers, order medicines requiring a prescription, book travel, or make
non-grocery purchases. Decline those clearly and do not attempt a workaround.