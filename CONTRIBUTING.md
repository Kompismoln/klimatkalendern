# Instructions for contributing to Klimatkalendern

If you'd like to help out developing klimatkalendern.nu, or are generally interested in tools to facilitate movement organization, drop us an email at info@klimatkalendern.nu. 

## Version control workflow

Klimatkalendern currently uses a two-trunk workflow. There are two long-lived branches: `main`, which builds the production site, and `dev`, which builds the test site.
Feature branches are created as needed and merged into `dev`. Direct pushes to `dev` are allowed but discouraged. Pull requests into `dev` do not require review or approval (but feel free to request it). `main` can only be changed by a PR from `dev`, this constitutes a release and requires approval from another maintainer.
