function WriteXmlToScreen ([xml]$xml)
{
    $StringWriter = New-Object System.IO.StringWriter;
    $XmlWriter = New-Object System.Xml.XmlTextWriter $StringWriter;
    $XmlWriter.Formatting = "indented";
    $xml.WriteTo($XmlWriter);
    $XmlWriter.Flush();
    $StringWriter.Flush();
    Write-Output $StringWriter.ToString();
}

function log
{
	param( [string]$text)
	Write-Host "Bump: $text"
}

function WriteXmlToScreen ([xml]$xml)
{
    $StringWriter = New-Object System.IO.StringWriter;
    $XmlWriter = New-Object System.Xml.XmlTextWriter $StringWriter;
    $XmlWriter.Formatting = "indented";
    $xml.WriteTo($XmlWriter);
    $XmlWriter.Flush();
    $StringWriter.Flush();
    Write-Output $StringWriter.ToString();
}

function log
{
	param( [string]$text)
	Write-Host "Bump: $text"
}

$MajorVersion = 2
$MinorVersion = 0
$projectFile = $args[0] # macro ProjectPath in VS Build Events
log "started, base version will be $MajorVersion.$MinorVersion (edit BumpProjectVersion.ps1 to change this)"
#log $projectFile
[xml]$xml = Get-Content -path $projectFile
#WriteXmlToScreen $xml
#log $xml.Project.PropertyGroup.Version
if($xml.Project.PropertyGroup -isnot [system.array])
{
	#log "propertygroup is not array"
	if(!$xml.Project.PropertyGroup.Version)
	{
		$versionelement = $xml.CreateElement("Version");
		$var = $xml.Project.PropertyGroup.AppendChild($versionelement)
		$xml.Project.PropertyGroup.Version = "$MajorVersion.$MinorVersion.0"
	}
	[string]$ov = $xml.Project.PropertyGroup.Version
	$parts = $ov.Split(".")
	[int]$revision = $parts[2]
	$revision = $revision + 1
	$newVersion = "$MajorVersion.$MinorVersion.$revision"
	log "new version $newVersion"
	$xml.Project.PropertyGroup.Version = $newVersion
	}
else 
{
	if(!$xml.Project.PropertyGroup[0].Version)
	{
		$versionelement = $xml.CreateElement("Version");
		$var = $xml.Project.PropertyGroup[0].AppendChild($versionelement)
		$xml.Project.PropertyGroup[0].Version = "$MajorVersion.$MinorVersion.0"
	}
	[string]$ov = $xml.Project.PropertyGroup[0].Version
	$parts = $ov.Split(".")
	[int]$revision = $parts[2]
	$revision = $revision + 1
	$newVersion = "$MajorVersion.$MinorVersion.$revision"
	log "new version $newVersion"
	$xml.Project.PropertyGroup[0].Version = $newVersion
}
$xml.Save($projectFile)