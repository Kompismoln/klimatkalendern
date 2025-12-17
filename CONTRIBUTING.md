# Instructions for contributing to Klimatkalendern
## Version control workflow
There are two long-lived branches: `main`, which builds the production site, and `dev`, which builds the test site.
Feature branches are created as needed and continuously merged into `dev`. Direct pushes to `dev` are allowed but discouraged.
`main` can only be changed by a PR from `dev`, this constitutes a release and requires approval from another maintainer.
