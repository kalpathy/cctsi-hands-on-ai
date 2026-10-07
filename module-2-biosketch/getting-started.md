# Getting started with the record builder

If possible, read this before session 1. Nothing needs to be installed, and there is no account
to create.

**The page:** https://kalpathy.github.io/cctsi-hands-on-ai/module-2-biosketch/record.html

## 1. Find your ORCID iD

Sign in at **orcid.org**. Your iD is the sixteen-digit number under your name, in the form
`0000-0001-2345-6789`.

**No ORCID yet?** Register at orcid.org. It takes about two minutes, and NIH requires one linked
to your eRA Commons account for anyone who submits a biosketch.

**Supporting a PI instead?** ORCID iDs are public. Search for the PI by name at orcid.org and copy
their iD. You will be able to see what their record is missing, but only they can fix it.

## 2. Check what ORCID shows to everyone

The page reads your **public** ORCID record, the same view anyone else gets. Anything you have set
to *Trusted parties* or *Only me* will not appear.

In ORCID, look at the eye icon next to **Works** and **Employment**. If you want the page (and
SciENcv's ORCID import) to see them, set them to **Everyone**.

## 3. Optional: your grants from NIH RePORTER

RePORTER does not allow web pages to read from it directly, so the page takes a file instead.

1. Go to **reporter.nih.gov** and search with your name as the PI.
2. On the results page, use **Export** and choose **CSV**.
3. In the record builder, drop that file onto the **Add your grants** box, or click the box and
   choose it.

No NIH grants? Skip this. Grants from other funders can be typed into the record later.

## 4. Optional: a specific aims page

A current or planned aims page, as plain text you can paste. It is used to rank your publications
against the project. Nothing is sent anywhere: the ranking happens in your browser.

---

## Troubleshooting

| What you see | What to do |
|---|---|
| "is not a valid ORCID iD" | Check the format: four groups of four, separated by hyphens. The last character can be an X. |
| "ORCID returned 404" | The iD does not exist. Copy it again from orcid.org rather than typing it. |
| ORCID returned 0 works | Your works are probably not public. See step 2. |
| Far fewer works than you expected | Some are private, or were never added to ORCID. That is a real finding: SciENcv will not see them either. |
| "lookup(s) failed and were left blank" | PubMed or Crossref was slow. Wait a moment and press the button again. |
| The grants file does not load | Make sure it is the CSV from RePORTER's Export, not a screenshot or a PDF. |
| Everything vanished after closing the browser | Private windows do not keep anything. Use **Download my record** before you close, and **Open a saved record** to bring it back. |
| Coming back on a different laptop | **Open a saved record** and choose the `career-record.json` you downloaded. |
| Checking several PIs, one after another | **Start a new record** between them, so one person's entries do not carry over. |

Still stuck? Raise a hand. That is what the hour is for.
