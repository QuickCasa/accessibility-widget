# Security

This script runs on other people's websites, so we take reports seriously.

## Reporting a vulnerability

Please **do not open a public issue**. Report it privately through GitHub
instead:

1. Open the [Security tab](https://github.com/QuickCasa/accessibility-widget/security)
   of this repository.
2. Choose **Report a vulnerability**.

Include what an attacker could do, the steps to reproduce it, and the browser
you used. We will acknowledge the report, keep you updated while we work on a
fix, and credit you in the release notes unless you would rather stay anonymous.

## What is in scope

- Anything that lets a data attribute, stored preference or host page inject
  script or arbitrary CSS through the widget.
- Anything that makes the widget leak data off the visitor's device. It should
  never make a network request.
- Anything that lets the widget break or hide the host page in a way the
  visitor cannot undo with the reset button.

## Supported versions

Security fixes go into the latest release of the current major version.
