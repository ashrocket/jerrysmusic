#!/usr/bin/env python3
"""Download Jerry's music files from Google Drive using Chrome cookies."""
import os
import time
import requests
import browser_cookie3

FILES = [
    # album-01: Jerry's Very First Recordings - 1955
    ("1zWQI4lQjnJvjyGdCmmoHPnC7fOco50RJ", "audio-temp/album-01/01-if-you-were-the-only-girl.mp3"),
    ("11_f1qbUmg9LUDQBEcAEgKStnbj2DJwDq", "audio-temp/album-01/02-because.mp3"),
    # album-02: Jerry's Studio Tracks - 2002
    ("1nBFmBRoTxvumab7Ly6RLIpWZtSfIQfVO", "audio-temp/album-02/01-day-by-day.mp3"),
    ("1fxX-In_bK_osd13qKvsivqquS6N5xVA_", "audio-temp/album-02/02-fly-me-to-the-moon.mp3"),
    ("1W42AElVRElsB0yxdBnTRQ1tlbWySydBC", "audio-temp/album-02/05-lets-fall-in-love.mp3"),
    ("1oGIgjM8bHByZbz5sVrpNgnr6qRPMbzFE", "audio-temp/album-02/06-nice-work-if-you-can-get-it.mp3"),
    ("1UdRPdiUwFVQd3_xl5ynyV1tqRH83qyFN", "audio-temp/album-02/07-all-of-me.mp3"),
    ("1W7kSW9jFp_a3cJkATMHnZKAzTX-UD-nD", "audio-temp/album-02/08-stompin-at-the-savoy.mp3"),
    ("1C1nuBCGwbQMbnsTN-R3K2mMykkNiW0xa", "audio-temp/album-02/09-all-the-things-you-are.mp3"),
    # album-03: Acoustic Session 1996 - Jazz
    ("1MtQZjHkK87uHFJauGqFanICFffnIjT4j", "audio-temp/album-03/jazz/01-takin-a-chance-on-love.mp3"),
    ("1XJze33iJv1axUHnB6khv3HzKLhfpvv2v", "audio-temp/album-03/jazz/02-one-mint-julep.mp3"),
    ("1I0dHjA64ASlBkE8CBtpb8cALLBcO0lNJ", "audio-temp/album-03/jazz/03-one-note-samba.mp3"),
    ("19S1PiBekoDN5O9Zb9f72T1HGgqG1W9Zn", "audio-temp/album-03/jazz/04-the-entertainer.mp3"),
    ("1WvgDfEx6V7KhyYbpM6YH6UJn53syafb3", "audio-temp/album-03/jazz/05-all-the-things-you-are.mp3"),
    ("17nrILjJC91ZgKrvA4TdKa8YcCSN_Vukg", "audio-temp/album-03/jazz/06-dont-get-around-much-anymore.mp3"),
    ("1nEFhB7Zl_yOkecDFyERtMrPpAL3pXoUv", "audio-temp/album-03/jazz/07-stompin-at-the-savoy.mp3"),
    ("1EVK4VnkxEKyd5hUSX1cmtGSNV8pnZvl5", "audio-temp/album-03/jazz/08-chord-progression-with-dad.mp3"),
    # album-03: Acoustic Session 1996 - Blues
    ("1NKui2wELsDffGAUXZIDPgZ0Vr6b_3UIp", "audio-temp/album-03/blues/01-stormy-monday-blues.mp3"),
    ("1V3Ut96LescOVjKRacYGODx2xwZ5CUHZx", "audio-temp/album-03/blues/02-12-bar-blues.mp3"),
    # album-03: Acoustic Session 1996 - Classical
    ("15Uq3RXFdDectA5pJoEPYcnxVxdbxiUMm", "audio-temp/album-03/classical/01-asturias-isaac-albeniz.mp3"),
    ("1J45jnSb1YWl6gOlfDJsj9yeocCxY72fL", "audio-temp/album-03/classical/02-villa-lobos-prelude-2.mp3"),
    ("1f1fNbwHcza1ezE7aYqMdjXW22Ua0OLst", "audio-temp/album-03/classical/03-villa-lobos-etude-2.mp3"),
    ("100fDWocUfp_9upEQ1gPIFoytCL0y5IWv", "audio-temp/album-03/classical/04-fernando-sor.mp3"),
    # album-04: Lake Elsinore Band - 2002
    ("14VGcRsZF6668H-5rtjMktpTxVLKvZ7gC", "audio-temp/album-04/a-train.mp3"),
    ("1RFVZIkHeJuHebvSMzrrB-nrTKTy2NCD5", "audio-temp/album-04/autumn-leaves.mp3"),
    ("1gOyRgBbD45b0f7dlFB-_RiSoZU0JaoBU", "audio-temp/album-04/chattanooga-choo-choo.mp3"),
    ("1ceBl2vrsl4uSZEEix-ypJ3ZURhFgelL8", "audio-temp/album-04/cry-me-a-river.mp3"),
    ("11__27TlNwwHqaGEqis5_IM_lEH_OexYQ", "audio-temp/album-04/dont-get-around-much-anymore.mp3"),
    ("1JIRZlNxXV55ovKQ_iA9q9DJ-vkQsy1B6", "audio-temp/album-04/fly-me-to-the-moon.mp3"),
    ("1_kfwzLY7FSN_TN1qz4KEroyLdnPBYWcX", "audio-temp/album-04/girl-from-ipanema.mp3"),
    ("19gF8sXP0dzMJm1TQ3-q6erxfYVXhCn9k", "audio-temp/album-04/high-heel-sneakers.mp3"),
    ("1-O6NZsHZfcufQhVBX9MvxQbI8zUgSfzV", "audio-temp/album-04/tennessee-waltz.mp3"),
    ("1fBYuh9FbX1ZHsBxbHaiuifB3npU4J1SK", "audio-temp/album-04/over-the-rainbow.mp3"),
    ("1ZUnaPNDAhevudhcLJjj6qKjN59au9Ftz", "audio-temp/album-04/youre-sixteen.mp3"),
]

BASE_DIR = "/Users/ashrocket/ashcode/jerrysmusic"

def download_file(session, file_id, output_path):
    full_path = os.path.join(BASE_DIR, output_path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)

    if os.path.exists(full_path) and os.path.getsize(full_path) > 0:
        print(f"  SKIP (exists): {output_path}")
        return True

    url = f"https://drive.google.com/uc?export=download&id={file_id}&confirm=t"
    print(f"  Downloading: {output_path}...")

    try:
        response = session.get(url, stream=True, timeout=60)
        response.raise_for_status()

        content_type = response.headers.get('Content-Type', '')
        if 'html' in content_type:
            # Try alternate URL
            url2 = f"https://drive.google.com/uc?id={file_id}&export=download"
            response = session.get(url2, stream=True, timeout=60)

        with open(full_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)

        size = os.path.getsize(full_path)
        print(f"  OK: {output_path} ({size:,} bytes)")
        return True
    except Exception as e:
        print(f"  FAIL: {output_path} - {e}")
        return False

def main():
    print("Loading Chrome cookies...")
    try:
        cj = browser_cookie3.chrome(domain_name='.google.com')
        session = requests.Session()
        session.cookies.update(cj)
        session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        })
        print(f"Loaded {len(session.cookies)} cookies")
    except Exception as e:
        print(f"Cookie load error: {e}")
        session = requests.Session()

    success = 0
    failed = []
    for file_id, output_path in FILES:
        ok = download_file(session, file_id, output_path)
        if ok:
            success += 1
        else:
            failed.append(output_path)
        time.sleep(0.5)

    print(f"\nDone: {success}/{len(FILES)} downloaded")
    if failed:
        print("Failed:")
        for f in failed:
            print(f"  {f}")

if __name__ == "__main__":
    main()
