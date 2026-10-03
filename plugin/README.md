# Payo — ChatGPT plugin package

Submission bundle for the OpenAI Plugins directory.

```
plugin.json     manifest: listing metadata, review test cases, publication settings
mcp.json        remote MCP server reference (streamable HTTP)
assets/         logo + composer icons, square 512px PNG (light and dark)
skills/         onboarding skill referenced by extensions.com.openai.onboardingSkill
```

## Validate

```bash
node scripts/check-plugin.mjs
```

## Before submitting

Set `review.demo_recording_url` in `plugin.json` to a public, reviewer-accessible
recording that walks through the five positive test cases. It is currently a
placeholder.

Test credentials go in the dashboard's **Review details** form, never in this package —
ZIP metadata rejects `test_credentials` and `reviewer_instructions`.

## Build

```bash
node scripts/build-plugin-icons.mjs   # regenerate square icons from the favicon
cd plugin && zip -r ../payo-plugin.zip . -x '*.DS_Store'
```
