import base64
import os
import re
import zlib
import pymupdf

def update_cv(pdf_path: str, output_path: str = None):
    if output_path is None:
        output_path = pdf_path

    with open(pdf_path, 'rb') as f:
        pdf_bytes = f.read()

    # Locate stream 12 (Page 1)
    obj12_header_idx = pdf_bytes.find(b'12 0 obj')
    s12_stream_start = pdf_bytes.find(b'stream\n', obj12_header_idx) + len(b'stream\n')
    s12_stream_end = pdf_bytes.find(b'endstream', s12_stream_start)
    raw12 = pdf_bytes[s12_stream_start:s12_stream_end]
    clean12 = re.sub(rb'\s+', b'', raw12)
    decomp12 = zlib.decompress(base64.a85decode(clean12, adobe=True)).decode('latin1')

    # Locate stream 13 (Page 2)
    obj13_header_idx = pdf_bytes.find(b'13 0 obj')
    s13_stream_start = pdf_bytes.find(b'stream\n', obj13_header_idx) + len(b'stream\n')
    s13_stream_end = pdf_bytes.find(b'endstream', s13_stream_start)
    raw13 = pdf_bytes[s13_stream_start:s13_stream_end]
    clean13 = re.sub(rb'\s+', b'', raw13)
    decomp13 = zlib.decompress(base64.a85decode(clean13, adobe=True)).decode('latin1')

    # Target replacements for Page 1 (Paddi & Lapi)
    old_paddi_tech = '(Flutter, Android Home Screen & iOS 18 Lock Screen Widgets, Dart, Local Storage) Tj T* ET'
    new_paddi_tech = '(Kotlin Multiplatform, Compose Multiplatform, SwiftUI & WidgetKit, Android AppWidget) Tj T* ET'

    old_paddi_b1 = '.014738 Tw (Published a production mobile utility with persistent, interactive desktop and lock-screen sticky note widgets) Tj T* 0 Tw (and custom styling.) Tj T* ET'
    new_paddi_b1 = '2.4499 Tw (Published production cross-platform utility with persistent desktop and lock-screen sticky note) Tj T* 0 Tw (widgets, sharing UI and business logic across Android and iOS via Compose Multiplatform.) Tj T* ET'

    old_paddi_b2 = '1.040591 Tw (Engineered native widget communication channels for instant two-way note state updates and offline-first) Tj T* 0 Tw (local persistence.) Tj T* ET'
    new_paddi_b2 = '2.3828 Tw (Engineered native iOS WidgetKit extensions \\(Swift, App Intents\\) and Android AppWidgets for) Tj T* 0 Tw (instant bidirectional note state updates and offline-first local persistence.) Tj T* ET'

    old_lapi_tech = '(Flutter, Elixir, Phoenix Framework, PostgreSQL, MVVM Architecture) Tj T* ET'
    new_lapi_tech = '(Kotlin, Jetpack Compose, Local LLM \\(llama.cpp\\), Room DB, Coroutines & Flow) Tj T* ET'

    old_lapi_b1 = '.790599 Tw (Designed and deployed a cross-platform productivity application with interactive calendar integrations and) Tj T* 0 Tw (state-driven task tracking.) Tj T* ET'
    new_lapi_b1 = '1.8302 Tw (Architected an offline-first task manager and habit tracker on Google Play and App Store with) Tj T* 0 Tw (reactive state management using Room SQLite, Coroutines, and Flow.) Tj T* ET'

    old_lapi_b2 = '.489559 Tw (Integrated high-throughput Elixir/Phoenix backend APIs and PostgreSQL persistence for synchronized user) Tj T* 0 Tw (workflows.) Tj T* ET'
    new_lapi_b2 = '1.1673 Tw (Integrated on-device local LLM \\(llama.cpp\\) via native C++ JNI with ARM NEON acceleration for) Tj T* 0 Tw (zero-latency, private schedule generation and natural language task parsing.) Tj T* ET'

    # Perform Page 1 replacements if present
    if old_paddi_tech in decomp12:
        decomp12 = decomp12.replace(old_paddi_tech, new_paddi_tech)
        decomp12 = decomp12.replace(old_paddi_b1, new_paddi_b1)
        decomp12 = decomp12.replace(old_paddi_b2, new_paddi_b2)
        decomp12 = decomp12.replace(old_lapi_tech, new_lapi_tech)
        decomp12 = decomp12.replace(old_lapi_b1, new_lapi_b1)
        decomp12 = decomp12.replace(old_lapi_b2, new_lapi_b2)

    # Personal data fix: Gender Female -> Male
    old_gender = '(Gender :) Tj /F3 10.5 Tf ( Female) Tj T* ET'
    new_gender = '(Gender :) Tj /F3 10.5 Tf ( Male) Tj T* ET'
    if old_gender in decomp13:
        decomp13 = decomp13.replace(old_gender, new_gender)

    # Technical Skills on Page 2
    old_lang = '(Languages:) Tj /F3 10.5 Tf ( Kotlin, Dart, Elixir, Python, SQL, Java) Tj T* ET'
    new_lang = '(Languages:) Tj /F3 10.5 Tf ( Kotlin, Swift, Dart, Elixir, Python, SQL, Java, C++) Tj T* ET'
    if old_lang in decomp13:
        decomp13 = decomp13.replace(old_lang, new_lang)

    old_mob = '(Mobile & Frontend:) Tj /F3 10.5 Tf ( Android SDK, Jetpack Compose \\(Material 3\\), Flutter, Android & iOS Widgets, XML) Tj T* ET'
    new_mob = '(Mobile & Frontend:) Tj /F3 10.5 Tf ( Android SDK, Jetpack Compose, Compose Multiplatform, Flutter, SwiftUI & WidgetKit) Tj T* ET'
    if old_mob in decomp13:
        decomp13 = decomp13.replace(old_mob, new_mob)

    old_arch = '(Room, Dagger-Hilt) Tj T* ET'
    new_arch = '(Room DB, Dagger-Hilt, Local LLM \\(llama.cpp\\)) Tj T* ET'
    if old_arch in decomp13:
        decomp13 = decomp13.replace(old_arch, new_arch)

    # Honors & Awards: remove incorrect "Team" label, DCI Week themes
    decomp13 = decomp13.replace(r'\(Team Tidal Forge\)', r'\(Theme: Tidal Forge\)')
    decomp13 = decomp13.replace(r'\(Team Digital Wizards\)', r'\(Theme: Digital Wizards\)')
    decomp13 = decomp13.replace(r'\(Team The Howl and the Brave\)', r'\(Theme: The Howl and the Brave\)')

    # Encode stream 12
    c12 = zlib.compress(decomp12.encode('latin1'))
    a12 = base64.a85encode(c12, adobe=True)[2:]
    obj12_content = f'12 0 obj\n<<\n/Filter [ /ASCII85Decode /FlateDecode ] /Length {len(a12)}\n>>\nstream\n'.encode('latin1') + a12 + b'\nendstream\nendobj\n'

    # Encode stream 13
    c13 = zlib.compress(decomp13.encode('latin1'))
    a13 = base64.a85encode(c13, adobe=True)[2:]
    obj13_content = f'13 0 obj\n<<\n/Filter [ /ASCII85Decode /FlateDecode ] /Length {len(a13)}\n>>\nstream\n'.encode('latin1') + a13 + b'\nendstream\nendobj\n'

    part1 = pdf_bytes[:obj12_header_idx]
    body = part1 + obj12_content + obj13_content

    offsets = [0] * 14
    for i in range(1, 14):
        target = f'{i} 0 obj'.encode('latin1')
        idx = body.find(target)
        offsets[i] = idx

    xref_start = len(body)
    xref_text = f'xref\n0 14\n0000000000 65535 f \n'
    for i in range(1, 14):
        xref_text += f'{offsets[i]:010d} 00000 n \n'

    trailer_text = f'''trailer
<<
/ID 
[<51beef67959f3180cf6cb8fcc3cc559f><51beef67959f3180cf6cb8fcc3cc559f>]
% ReportLab generated PDF document -- digest (opensource)

/Info 10 0 R
/Root 9 0 R
/Size 14
>>
startxref
{xref_start}
%%EOF
'''

    final_pdf = body + xref_text.encode('latin1') + trailer_text.encode('latin1')
    with open(output_path, 'wb') as f_out:
        f_out.write(final_pdf)

    # Validate
    doc = pymupdf.open(output_path)
    print(f'✅ Successfully updated {output_path} (Pages: {len(doc)})')

if __name__ == '__main__':
    cv_path = os.path.expanduser('~/Downloads/John_Carlo_Cacao_CV.pdf')
    if os.path.exists(cv_path):
        update_cv(cv_path)
    else:
        print(f'CV not found at {cv_path}')
