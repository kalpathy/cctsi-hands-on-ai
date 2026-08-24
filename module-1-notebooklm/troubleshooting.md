# Troubleshooting

## I cannot sign in with my CU account

**NotebookLM is authorised at CU Anschutz and your account should already have it.** So this is
almost certainly a sign-in problem rather than a permissions one, and the first step below fixes
the large majority of cases.

Try in this order, and stop as soon as one works.

1. **Sign out of every Google account**, then go to notebooklm.google.com and sign in with
   `@cuanschutz.edu` only. Most failures are a personal account silently taking over the session.
2. **Try an incognito or private window.** This rules out the same problem a different way.
3. **Try a different browser.** Chrome tends to have the fewest surprises here.
4. **Use a personal Google account for now.** Every exercise in the session works. Keep it to
   public papers only, since a personal account is not covered by the University agreement.

If none of that works, your account may genuinely not have been provisioned, which is an OIT
question rather than something you can fix yourself. Say so in the pre-session survey and we will
chase it. You are still covered on the day: a personal Google account does every exercise in the
session, and if all else fails you will be paired with a neighbour.

## My PDF will not upload

- **Check the page count.** Very long documents can fail or truncate. Some guidelines run to
  hundreds of pages.
- **Scanned PDFs with no text layer** will import as an image and the notebook will find nothing in
  them. If you cannot select text in the PDF, NotebookLM cannot read it either. This is exactly the
  problem module 4 is about.
- **Try the URL instead.** If the document lives on the web, adding it as a Website source is often
  faster and more reliable than uploading a file.

## The room wifi is slow and my uploads are crawling

**Add sources as URLs instead of uploading files.** Twenty-five people uploading PDFs at once is
more than a lecture room usually handles. The NIH policy corpus is entirely URLs for this reason,
and it assembles in about four minutes.

## The answers are vague and unhelpful

Almost always the notebook is too broad. Fifteen sources spanning your whole field will answer
everything vaguely.

**Fix:** start a new notebook on one specific question and load only sources that bear on it. This
is a source-selection problem, not a prompting problem.

## It refused to answer something I know is in my sources

Worth investigating rather than shrugging at.

- Is the claim in a **figure or a table image** rather than in the text? It may not be readable.
- Is it in a **scanned page** with no text layer?
- Try asking more specifically, naming the document.

If it genuinely missed something that is plainly there, that is worth bringing to session 2. Those
examples are more instructive than the successes.

## It gave me an answer with no citation

Treat it with suspicion and ask it to point you at the source. Grounded answers carry citations.
An uncited claim in a grounded tool is the one thing in the interface that has not earned your
trust.

## It said something that contradicts what I know

**Click the citation and read the passage.** Then one of three things is true, and they are all
worth knowing:

1. The source says it, and you have learned something.
2. The source says something subtly different, and the notebook overstated it. This is the common
   one, and it is why the citation matters.
3. The citation does not support the claim at all. Rare in a grounded tool, and worth showing
   everyone in session 2.

## Audio Overview is taking forever

It takes several minutes. Start it and do something else. It cannot be rushed, and it cannot be
generated live in front of an audience, which is why the demo version was made the night before.
