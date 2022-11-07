# Error Codes

## General (001 - 099)
### Init related
- `001` : `Contract already exists, already initialized`
### Input
- `100` : `Invalid input address`
- `101` : `Input value cannot be empty`
- `102` : `Input arrays length mismatch`
- `103` : `Amounts mismatch`
- `104` : `Input has duplicates`
- `105` : `Invalid array length`
- `106` : `Invalid time input`
## Deals (200 - 299)
## Launch (300 - 399)
### Input (300 - 319)
- `300` : `SoftCap cannot be bigger than hardCap`
- `301` : `Tip percentage cannot be bigger than 45%`
- `302` : `Invalid class ID`
- `303` : `Invalid caps relation`
- `304` : `Cannot add batch bigger than 100 classes`
- `305` : `Cannot add more than 256 classes`
### Permissions (320 - 339)
- `320` : `msg.sender is not allowed to buy`
- `321` : `Contract should not be initialized or caller should be admin`
- `322` : `msg.sender is not the admin`
### State (340 - 359)
- `340` : `Maximum funding target reached`
- `341` : `Minimum funding target not reached`
- `342` : `Minimum funding target reached`
- `343` : `Contract has not been funded with sufficient Seed tokens`
- `344` : `Seed has not started yet`
- `345` : `Seed token balans is zero`
- `346` : `Seed is not yet complete, tokens are not claimable`
- `347` : `Seed is permission-less`
- `348` : `Seed is closed`
- `349` : `Seed is paused`
- `350` : `Seed is not Live`
- `351` : `Seed is not paused`
### Buy (360 - 379)
- `360` : `Maximum personal funding reached`
- `361` : `Buying only allowed while the Seed is Live`
### Claim / Withdraw (380 - 399)
- `380` : `Claimable amount is zero`
- `381` : `Cannot claim more than claimable amount`
- `382` : `Cannot withdraw Seed tokens while Seed is not complete`
- `383` : `Cannot claim while funding tokens can still be withdrawn`

