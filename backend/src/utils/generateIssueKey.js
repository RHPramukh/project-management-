// Must be called inside a prisma $transaction to avoid two issues racing for the same number.
async function nextIssueKey(tx, project) {
  const updated = await tx.project.update({
    where: { id: project.id },
    data: { issueCounter: { increment: 1 } },
  });
  return `${updated.key}-${updated.issueCounter}`;
}

module.exports = { nextIssueKey };
