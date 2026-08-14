# Sky Reign — tournament registration

A single-page registration form. Submissions land in a Supabase table; one
script pulls them into an Excel file. No build step, no framework.

| File | What it is |
| --- | --- |
| `index.html` | The form. Open it, host it, done. |
| `supabase-setup.sql` | Creates the table. Run once. |
| `export-to-excel.py` | Writes `registrations.xlsx`. |

## Setup (once)

1. **Create the table.** In your Supabase project → SQL Editor, paste
   `supabase-setup.sql` and run it.
2. **Wire up the form.** In Supabase → Project Settings → API, copy the
   Project URL and the `anon` key into the CONFIG block near the bottom of
   `index.html`.
3. **Publish `index.html`.** Any static host works — Netlify, Vercel,
   Cloudflare Pages, GitHub Pages. Drag the file in; there's nothing to build.

## Per tournament

Edit the three marked lines at the top of `index.html` for the name, dates,
and format. Update the `<option>` list under Game if the titles change.

**To close registration:** set `REGISTRATION_OPEN = false` in the CONFIG block
and re-upload. The form is replaced by a "registration closed" notice.
Set it back to `true` to reopen.

## Getting the Excel sheet

```
pip install requests openpyxl
set SUPABASE_URL=https://YOUR-PROJECT.supabase.co
set SUPABASE_SERVICE_KEY=your-service-role-key
python export-to-excel.py
```

Produces `registrations.xlsx` — one row per team, newest last, with filters
and a frozen header row. Re-run it any time for a fresh copy.

For a quick look without the script, Supabase → Table Editor → `registrations`
→ Export as CSV opens fine in Excel.

## A note on the two keys

The **anon** key is in `index.html` and is public by design. The table policy
allows `insert` only and there is no `select` policy, so that key can add a
registration but cannot read anyone's email or phone number back.

The **service_role** key is only for `export-to-excel.py`. It bypasses those
rules. Keep it in your environment, never in the HTML, never committed.
