#!/usr/bin/env bash
set -euo pipefail

run_wstest_e2e() {
  local attempt="$1"
  echo "::group::WSTest E2E attempt ${attempt}/2"
  export E2E_TRACE_DIR="test-results/wstest-e2e/attempt-${attempt}"
  local test_exit=0
  npm run test:wstest-e2e || test_exit=$?
  echo "::endgroup::"
  return "$test_exit"
}

if run_wstest_e2e 1; then
  exit 0
fi

# Every suite invocation updates the independent provider-managed What's
# Changed fixture, then establishes a clean UI-peer baseline. A failed
# lifecycle run cleans up in afterAll so the retry starts without an
# account-wide wipe.
echo "retried=true" >> "${GITHUB_OUTPUT:-/dev/null}"
{
  echo "## WSTest E2E retry"
  echo "Attempt 1 failed; the suite was retried after a 30-second backoff."
} >> "${GITHUB_STEP_SUMMARY:-/dev/null}"
echo "::warning::WSTest E2E attempt 1 failed; retrying the clean suite in 30 seconds"
sleep 30

run_wstest_e2e 2
