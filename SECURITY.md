# Security Policy

## Supported Versions

We currently support the following versions of Underscore with security updates:

- the latest commit on the `master` branch (published as "edge" on the
  [project website][website]);
- the 1.x release tagged as [latest][npm-latest] on npm;
- any release tagged as [preview][npm-preview] on npm, if present.

[website]: https://underscorejs.org
[npm-latest]: https://www.npmjs.com/package/underscore/v/latest
[npm-preview]: https://www.npmjs.com/package/underscore/v/preview

## Reporting a Vulnerability

Please report security issues by sending an email to
dev@juliangonggrijp.com and jashkenas@gmail.com.

Do __not__ submit an issue ticket or pull request or otherwise publicly
disclose the issue.

After receiving your email, we will respond as soon as possible and indicate
what we plan to do.

### A note on `_.template`

[`template`][template] allows the user to inject arbitrary JavaScript
code in the template string. This is allowed by design. In fact, it is
the main feature of `template`. Without this feature, templates would
not be able to have conditional or repeated sections.

Because of this feature, it is the responsibility of the user not to
pass any untrusted input to `template`. The contract is similar to
that of the `Function` constructor or even `eval`: this function is so
powerful that it can be dangerous, so users must only pass trusted input. This is made explicit in [the documentation][template].

If this does not sound exactly like what you were considering to
report, or in case of doubt, please do send us a report. Of course, we
would rather be safe than sorry. You would not be the first to find a
[vulnerability in `template`][cve-2021-23358].

[template]: https://underscorejs.org/#template
[cve-2021-23358]: https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2021-23358

## Disclosure policy

After confirming a vulnerability, we will generally release a security update
as soon as possible, including the minimum amount of information required for
software maintainers and system administrators to assess the urgency of the
update for their particular situation.

We postpone the publication of any further details such as code comments,
tests, commit history and diffs, in order to enable a substantial share of the
users to install the security fix before this time.

Upon publication of full details, we will credit the reporter if the reporter wishes to be publicly identified.
