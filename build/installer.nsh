!include "FileFunc.nsh"
!include "LogicLib.nsh"
!include "x64.nsh"
!include "WinMessages.nsh"
!include "StdUtils.nsh"
!include "nsDialogs.nsh"

; --------------------------------------
; 🔑 CẤU HÌNH KHÓA CÀI ĐẶT (KEY)
; --------------------------------------
; Khai báo biến
Var Dialog
Var Label
Var TextKey
Var InputKey

; --- HÀM HIỂN THỊ TRANG NHẬP KEY ---
Function ShowKeyPage
  nsDialogs::Create 1018
  Pop $Dialog

  ${If} $Dialog == error
    Abort
  ${EndIf}

  ; Tạo nhãn hướng dẫn
  ${NSD_CreateLabel} 0 0 100% 12u "Vui lòng nhập Mã Kích Hoạt để tiếp tục cài đặt:"
  Pop $Label

  ; Tạo ô nhập liệu (Text Box)
  ${NSD_CreateText} 0 13u 100% 12u ""
  Pop $TextKey
  
  ; Focus vào ô nhập liệu
  ${NSD_SetFocus} $TextKey

  nsDialogs::Show
FunctionEnd

; --- HÀM KIỂM TRA KEY KHI BẤM NEXT ---
Function ValidateKey
  ; Lấy giá trị người dùng nhập vào
  ${NSD_GetText} $TextKey $InputKey
  
  ; === 🔒 ĐỔI KEY CỦA BẠN Ở DÒNG DƯỚI ===
  ${If} $InputKey != "AT-DIGITAL-2026" 
      MessageBox MB_OK|MB_ICONSTOP "Mã kích hoạt không đúng! Vui lòng liên hệ quản trị viên."
      Abort ; Dừng lại, không cho qua trang sau
  ${EndIf}
FunctionEnd

; 👇 QUAN TRỌNG: ĐĂNG KÝ TRANG TÙY CHỈNH
; Trang này sẽ hiện ra đầu tiên trong quá trình cài đặt
Page custom ShowKeyPage ValidateKey
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