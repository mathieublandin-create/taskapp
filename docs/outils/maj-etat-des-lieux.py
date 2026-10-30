#!/usr/bin/env python3
"""Régénère le tableau d'avancement et le chiffre clé de docs/etat-des-lieux.html
à partir de docs/etat-des-lieux-avancement.json (OPT-12). Aucun calcul à la main.

Usage : python3 docs/outils/maj-etat-des-lieux.py
Pour changer l'avancement, modifier seulement le champ « etape » d'un rang dans le JSON.
"""
import json, re, sys
from pathlib import Path

RACINE = Path(__file__).resolve().parents[2]
HTML = RACINE / "docs/etat-des-lieux.html"
DONNEES = RACINE / "docs/etat-des-lieux-avancement.json"


def fr(n):
    """Nombre au format français : 38,5 ou 12."""
    return f"{n:g}".replace(".", ",")


def barre(pct, doing=False):
    classe = "bar doing" if doing else "bar"
    return f'<div class="{classe}" role="img" aria-label="{pct} %"><i style="width:{pct}%"></i></div>'


def main():
    data = json.loads(DONNEES.read_text(encoding="utf-8"))
    bareme, rangs = data["bareme"], data["rangs"]
    inconnues = {r["etape"] for r in rangs} - set(bareme)
    if inconnues:
        sys.exit(f"Étape(s) hors barème : {sorted(inconnues)}")
    total = sum(r["jours"] for r in rangs)
    realises = sum(r["jours"] * bareme[r["etape"]] / 100 for r in rangs)
    pct = round(100 * realises / total)

    lignes = "".join(
        f'<tr><td class="n">{r["rang"]}</td><td>{r["contenu"]}</td>'
        f'<td class="n hide-s">{fr(r["jours"])} j</td><td>{r["etape"]}</td>'
        f'<td>{barre(bareme[r["etape"]])}</td><td class="n">{bareme[r["etape"]]} %</td></tr>'
        for r in rangs
    )
    ligne_total = (
        f'<tr class="total"><td></td><td>Lot 1, global (pondéré par l\'estimation)</td>'
        f'<td class="n hide-s">{fr(total)} j</td><td>{fr(realises)} j réalisés</td>'
        f'<td>{barre(pct, True)}</td><td class="n">{pct} %</td></tr>'
    )

    html = HTML.read_text(encoding="utf-8")
    debut = html.index("<tbody>", html.index('id="t-prog"')) + len("<tbody>")
    fin = html.index("</tbody>", debut)
    html = html[:debut] + lignes + "\n          " + ligne_total + "\n        " + html[fin:]
    html, n = re.subn(r'(<div class="kpi"><b>)\d+ %(</b><small>avancement du lot 1)', rf"\g<1>{pct} %\2", html)
    if n != 1:
        sys.exit("Chiffre clé d'avancement introuvable")
    HTML.write_text(html, encoding="utf-8")
    print(f"{fr(realises)} j sur {fr(total)} j : {pct} %")


main()
