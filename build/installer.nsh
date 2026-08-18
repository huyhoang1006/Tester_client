!include "FileFunc.nsh"
!include "LogicLib.nsh"
!include "x64.nsh"
!include "WinMessages.nsh"
!include "StdUtils.nsh"
!include "nsDialogs.nsh"

; --------------------------------------
; 🔑 TRANG NHẬP MÃ KÍCH HOẠT — ĐANG TẮT
; --------------------------------------
; Tạm bỏ để cài đặt không bị chặn. Sẽ tính lại sau.
;
; Toàn bộ phần dưới đây được giữ nguyên trong comment thay vì xoá, để bật lại chỉ là
; bỏ dấu `;` — khỏi phải viết lại trang nsDialogs từ đầu.
;
; LƯU Ý KHI BẬT LẠI: cách kiểm này chỉ là so chuỗi ngay trong bộ cài, nên mã nằm dạng
; chữ thường trong file .exe và ai mở bằng trình xem chuỗi cũng đọc được. Nó chặn được
; người cài nhầm, KHÔNG chặn được người cố tình. Cần chặn thật thì phải kiểm ở phía
; server lúc chạy, không phải ở bước cài.
;
; Var Dialog
; Var Label
; Var TextKey
; Var InputKey
;
; Function ShowKeyPage
;   nsDialogs::Create 1018
;   Pop $Dialog
;
;   ${If} $Dialog == error
;     Abort
;   ${EndIf}
;
;   ${NSD_CreateLabel} 0 0 100% 12u "Vui lòng nhập Mã Kích Hoạt để tiếp tục cài đặt:"
;   Pop $Label
;
;   ${NSD_CreateText} 0 13u 100% 12u ""
;   Pop $TextKey
;
;   ${NSD_SetFocus} $TextKey
;
;   nsDialogs::Show
; FunctionEnd
;
; Function ValidateKey
;   ${NSD_GetText} $TextKey $InputKey
;
;   ${If} $InputKey != "AT-DIGITAL-2026"
;       MessageBox MB_OK|MB_ICONSTOP "Mã kích hoạt không đúng! Vui lòng liên hệ quản trị viên."
;       Abort
;   ${EndIf}
; FunctionEnd
;
; Page custom ShowKeyPage ValidateKey
; --------------------------------------

; 🧩 BẮT NSIS LUÔN DÙNG CONTEXT CỦA USER HIỆN TẠI
!macro customInit
  SetShellVarContext current
!macroend

; 🗂️ SAO CHÉP DỮ LIỆU
!macro copyResourceToUserData
  CreateDirectory "$APPDATA\ATDigitalTester"
  IfFileExists "$APPDATA\ATDigitalTester\database\" 0 +3
    Goto +4
  CreateDirectory "$APPDATA\ATDigitalTester\database"
  CopyFiles /SILENT "$INSTDIR\resources\database\*.*" "$APPDATA\ATDigitalTester\database"

  IfFileExists "$APPDATA\ATDigitalTester\attachment\" 0 +3
    Goto +4
  CreateDirectory "$APPDATA\ATDigitalTester\attachment"
  CopyFiles /SILENT "$INSTDIR\resources\attachment\*.*" "$APPDATA\ATDigitalTester\attachment"
!macroend

; ⚙️ KHỞI CHẠY ỨNG DỤNG
!macro RunApp
  ${StdUtils.ExecShellAsUser} $0 "$launchLink" "open" ""
!macroend

; 🌐 MỞ TRANG WEB
!macro OpenPage
  ExecShell "open" "https://automationandtesting.vn/"
!macroend

; ✅ HOÀN TẤT
!macro customQuit
  Quit
!macroend

; 🔄 TOÀN BỘ LUỒNG INSTALL
!macro customInstall
  !insertmacro copyResourceToUserData
  !insertmacro RunApp
  !insertmacro OpenPage
  !insertmacro customQuit
!macroend