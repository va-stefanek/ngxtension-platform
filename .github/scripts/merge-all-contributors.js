module.exports = async ({ github, context }) => {
	const creator = context.payload.sender.login;

	if (creator.includes('allcontributors')) {
		return;
	}

	const prNumber = context.payload.number;
	const owner = context.payload.repository.owner.login;
	const repo = context.payload.repository.name;

	console.log(
		`[merge contributors workflow] merging ${prNumber} on ${owner}/${repo}`
	);
	const comments = await github.rest.issues.listComments({
		owner,
		repo,
		issue_number: prNumber,
	});

	console.log(`[merge contributors] found comments`, comments);

	for (const comment of comments) {
		if (comment.user.login.includes('allcontributors')) {
			const allContributorsPr = comment.body.match(/\/pull\/(\d+)/)?.[1];
			if (allContributorsPr) {
				const pr = await github.rest.pulls.get({
					owner,
					repo,
					pull_number: allContributorsPr,
				});
				if (pr && pr.mergeable) {
					await github.rest.pulls.merge({
						owner,
						repo,
						pull_number: pr.number,
					});
				}
			}
			break;
		}
	}
};
