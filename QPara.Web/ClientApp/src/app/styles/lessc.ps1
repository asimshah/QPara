#
# lessc.ps1
#
$lessSourceFiles = Get-ChildItem -Filter "*.less"
ForEach($lessfile in $lessSourceFiles)
{
	$cssFile = $lessfile.BaseName + ".css"
	node C:\Users\Asim\AppData\Roaming\npm\node_modules\less\bin\lessc $lessfile > $cssFile
	Write-Host "$lessfile to $cssFile"
}