!macro RunApp
  ${StdUtils.ExecShellAsUser} $0 "$launchLink" "open" ""
!macroend

!macro createFile
  SetShellVarContext all
  SetOverwrite on
  ReadRegStr $0 HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\ATDigitalTester" "DisplayVersion"
  StrCpy $9 "$0"
  FileOpen $8 "$APPDATA\ATDigitalTester\resources\DisplayVersion.txt" w
  FileWrite $8 "$9"
  FileClose $8
!macroend

!macro loadData
  !include LogicLib.nsh
  SetShellVarContext all
  FileOpen $8 "$APPDATA\ATDigitalTester\resources\DisplayVersion.txt" r
  ${If} ${Errors}
    MessageBox MB_OK "Cannot detect version of backup."
  ${Else}
    SetOverwrite on
    CopyFiles "$APPDATA\ATDigitalTester\resources\database\*.*" "$INSTDIR\resources\database"
    CopyFiles "$APPDATA\ATDigitalTester\resources\attachment\*.*" "$INSTDIR\resources\attachment"
    MessageBox MB_OK "database backup"
  ${EndIf}
!macroend

!macro copyResource
  !include LogicLib.nsh
  SetShellVarContext all
  ${IfNot} ${FileExists} "$APPDATA\ATDigitalTester\resources\*.*"
    CreateDirectory "$APPDATA\ATDigitalTester\resources\database"
    CreateDirectory "$APPDATA\ATDigitalTester\resources\attachment"
    ${If} ${Errors}
      MessageBox MB_OK "Error! Cannot backup database"
    ${Else}
      ${IfNot} ${FileExists} "$INSTDIR\resources\database\*.*"
        MessageBox MB_OK "Error! No database to backup"
      ${Else}
        SetOverwrite on
        CopyFiles "$INSTDIR\resources\database\*.*" "$APPDATA\ATDigitalTester\resources\database"
        CopyFiles "$INSTDIR\resources\attachment\*.*" "$APPDATA\ATDigitalTester\resources\attachment"
        MessageBox MB_OK "database backup"
      ${EndIf}
    ${EndIf}
  ${Else}
    ${IfNot} ${FileExists} "$INSTDIR\resources\database\*.*"
      MessageBox MB_OK "Error! No database to backup"
    ${Else}
      SetOverwrite on
      CopyFiles "$INSTDIR\resources\database\*.*" "$APPDATA\ATDigitalTester\resources\database"
      CopyFiles "$INSTDIR\resources\attachment\*.*" "$APPDATA\ATDigitalTester\resources\attachment"
      MessageBox MB_OK "database backup."
    ${EndIf}
  ${EndIf}
!macroend

!macro deleteConfig
  SetShellVarContext current
  RMDir /r /REBOOTOK "$APPDATA\ATDigitalTester"
!macroend

!macro OpenPage
  ExecShell "open" "https://www.facebook.com/atenergy2021"
!macroend

!macro customInstall
  MessageBox MB_YESNO "Do you want open Page of Product Company?" \
    /SD IDNO IDNO Skipped IDYES Accepted
  Accepted:
    MessageBox MB_YESNO "Load backup application data?" \
      /SD IDNO IDNO FALSE IDYES TRUE
    TRUE:
      !insertmacro loadData
    FALSE:
      !insertmacro OpenPage
      !insertmacro RunApp
      !insertmacro quitSuccess
  Skipped:
    MessageBox MB_YESNO "Load backup application data?" \
      /SD IDNO IDNO DECLINE IDYES CONFIRM
    CONFIRM:
      !insertmacro loadData
    DECLINE:
      !insertmacro RunApp
      !insertmacro quitSuccess
!macroend

!macro customUnInit
  !insertmacro copyResource
  !insertmacro createFile
!macroend