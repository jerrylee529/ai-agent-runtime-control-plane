#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://127.0.0.1:3000}"
PROJECT_ID="${PROJECT_ID:-}"
API_KEY="${API_KEY:-}"

if [[ -z "$PROJECT_ID" ]]; then
  echo "PROJECT_ID is required"
  exit 1
fi

if [[ -z "$API_KEY" ]]; then
  echo "API_KEY is required"
  exit 1
fi

AUTH_HEADER="Authorization: Bearer ${API_KEY}"
CONTENT_HEADER="Content-Type: application/json"

STARTED_AT="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
RUN_START_PAYLOAD=$(cat <<JSON
{
  "workflowName": "support-agent",
  "externalRunId": "demo-run-$(date +%s)",
  "environment": "prod",
  "triggerType": "manual",
  "startedAt": "${STARTED_AT}",
  "inputSummary": "Customer asked for a billing refund",
  "metadata": {
    "customerId": "cust_demo_123",
    "requestId": "req_demo_123"
  }
}
JSON
)

echo "==> Starting run"
RUN_RESPONSE=$(curl -sS -X POST "${BASE_URL}/api/v1/ingest/runs/start" -H "$AUTH_HEADER" -H "$CONTENT_HEADER" -d "$RUN_START_PAYLOAD")
echo "$RUN_RESPONSE"
RUN_ID=$(echo "$RUN_RESPONSE" | python3 -c 'import json,sys; print(json.load(sys.stdin)["data"]["run"]["id"])')

echo "==> Starting step 1"
STEP1_START=$(cat <<JSON
{
  "runId": "${RUN_ID}",
  "sequenceNo": 1,
  "stepName": "classify-ticket",
  "stepType": "llm",
  "provider": "openai",
  "model": "gpt-4.1-mini",
  "startedAt": "${STARTED_AT}",
  "inputPreview": "Classify this support ticket",
  "metadata": {
    "promptVersion": "v1"
  }
}
JSON
)
STEP1_RESPONSE=$(curl -sS -X POST "${BASE_URL}/api/v1/ingest/steps/start" -H "$AUTH_HEADER" -H "$CONTENT_HEADER" -d "$STEP1_START")
echo "$STEP1_RESPONSE"
STEP1_ID=$(echo "$STEP1_RESPONSE" | python3 -c 'import json,sys; print(json.load(sys.stdin)["data"]["step"]["id"])')

sleep 1
STEP1_ENDED_AT="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
STEP1_FINISH=$(cat <<JSON
{
  "status": "success",
  "endedAt": "${STEP1_ENDED_AT}",
  "outputPreview": "billing",
  "inputTokens": 420,
  "outputTokens": 60,
  "costUsd": 0.00112,
  "metadata": {
    "confidence": 0.92
  }
}
JSON
)

echo "==> Finishing step 1"
curl -sS -X POST "${BASE_URL}/api/v1/ingest/steps/${STEP1_ID}/finish" -H "$AUTH_HEADER" -H "$CONTENT_HEADER" -d "$STEP1_FINISH"
echo

echo "==> Starting step 2"
STEP2_STARTED_AT="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
STEP2_START=$(cat <<JSON
{
  "runId": "${RUN_ID}",
  "sequenceNo": 2,
  "stepName": "write-crm",
  "stepType": "action",
  "toolName": "hubspot.create_note",
  "actionName": "create_note",
  "targetSystem": "hubspot",
  "startedAt": "${STEP2_STARTED_AT}",
  "inputPreview": "Create CRM note for billing issue",
  "approvalStatus": "needs_review"
}
JSON
)
STEP2_RESPONSE=$(curl -sS -X POST "${BASE_URL}/api/v1/ingest/steps/start" -H "$AUTH_HEADER" -H "$CONTENT_HEADER" -d "$STEP2_START")
echo "$STEP2_RESPONSE"
STEP2_ID=$(echo "$STEP2_RESPONSE" | python3 -c 'import json,sys; print(json.load(sys.stdin)["data"]["step"]["id"])')

sleep 1
STEP2_ENDED_AT="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
STEP2_FINISH=$(cat <<JSON
{
  "status": "failed",
  "endedAt": "${STEP2_ENDED_AT}",
  "errorType": "tool_error",
  "errorMessage": "403 forbidden",
  "approvalStatus": "needs_review",
  "metadata": {
    "httpStatus": 403
  }
}
JSON
)

echo "==> Finishing step 2"
curl -sS -X POST "${BASE_URL}/api/v1/ingest/steps/${STEP2_ID}/finish" -H "$AUTH_HEADER" -H "$CONTENT_HEADER" -d "$STEP2_FINISH"
echo

RUN_ENDED_AT="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
RUN_FINISH_PAYLOAD=$(cat <<JSON
{
  "status": "failed",
  "endedAt": "${RUN_ENDED_AT}",
  "outputSummary": "Workflow failed while attempting CRM write",
  "totalInputTokens": 420,
  "totalOutputTokens": 60,
  "totalCostUsd": 0.00112,
  "errorType": "tool_error",
  "errorMessage": "CRM write failed",
  "metadata": {
    "finalState": "failed_on_write_crm"
  }
}
JSON
)

echo "==> Finishing run"
curl -sS -X POST "${BASE_URL}/api/v1/ingest/runs/${RUN_ID}/finish" -H "$AUTH_HEADER" -H "$CONTENT_HEADER" -d "$RUN_FINISH_PAYLOAD"
echo

echo "==> Done"
echo "PROJECT_ID=${PROJECT_ID}"
echo "RUN_ID=${RUN_ID}"
echo "STEP1_ID=${STEP1_ID}"
echo "STEP2_ID=${STEP2_ID}"
