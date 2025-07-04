!include "FileFunc.nsh"
!include "LogicLib.nsh"
!include "x64.nsh"
!include "WinMessages.nsh"
!include "StdUtils.nsh"

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