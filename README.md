# rd-doc-form

## Summary

Short summary on functionality and used technologies.

[picture of the solution in action, if possible]

## Used SharePoint Framework Version

![version](https://img.shields.io/badge/version-1.20.0-green.svg)

## Applies to

- [SharePoint Framework](https://aka.ms/spfx)
- [Microsoft 365 tenant](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/set-up-your-developer-tenant)

> Get your own free development tenant by subscribing to [Microsoft 365 developer program](http://aka.ms/o365devprogram)

## Prerequisites

> Any special pre-requisites?

## Solution

| Solution    | Author(s)                                               |
| ----------- | ------------------------------------------------------- |
| folder name | Author details (name, company, twitter alias with link) |

## Version history

| Version | Date             | Comments        |
| ------- | ---------------- | --------------- |
| 1.1     | March 10, 2021   | Update comment  |
| 1.0     | January 29, 2021 | Initial release |

## Disclaimer

**THIS CODE IS PROVIDED _AS IS_ WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING ANY IMPLIED WARRANTIES OF FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABILITY, OR NON-INFRINGEMENT.**

---

## Minimal Path to Awesome

- Clone this repository
- Ensure that you are at the solution folder
- in the command-line run:
  - **npm install**
  - **Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass**
  - **gulp serve**

> Include any additional steps as needed.

- To deploy
  - **gulp clean**
  - **gulp build**
  - **gulp bundle --ship**
  - **gulp package-solution --ship**

- To create app list for the site
  - **Connect-SPOService -Url https://servisac-admin.sharepoint.com**
  - **$site = Get-SPOSite https://servisac-admin.sharepoint.com/sites/acRdDokumenty**
  - **Add-SPOSiteCollectionAppCatalog -Site $site**

- Tutorial to create new Id for the app
  - **https://www.c-sharpcorner.com/article/deploy-multiple-instance-of-spfx-webpart-in-same-app-catalog/**

- App componentId: bfaa71b6-fe54-4c63-8952-dc4df878cbc4

- Content Type Id: 0x0101007A3267621C1D5F4AAFF76806178A9E4201
- List Name: acLibRozpracovane | Id: 16e60be6-ef8f-4477-9c2b-3ea1ada91468
- List Name: acLibPlatne | Id: a19374d6-b9bd-49ca-a808-a73085a7afc6
- List Name: acLibArchivne | Id: 50f7f4f0-8a38-4890-acf9-a92887454ad7

- To associate the app:
  - If PnP not installed:
    - **Install-Module -Name PnP.PowerShell -RequiredVersion 1.11.0**
    - **Register-PnPManagementShellAccess**

  - **$SiteURL = "https://servisac.sharepoint.com/sites/acRdDokumenty"**
  - **$ComponentId = "bfaa71b6-fe54-4c63-8952-dc4df878cbc4"**
  - **$ContentTypeId = "0x0101007A3267621C1D5F4AAFF76806178A9E4201"**
  
  - **Connect-PnPOnline -Interactive -Url $SiteURL**
  
  - **#acLibRozpracovane**
  - **$LibId = "16e60be6-ef8f-4477-9c2b-3ea1ada91468"**
  - **$ContentTypeId = "0x0101007A3267621C1D5F4AAFF76806178A9E420100C5F6E3EC31736F40B07DF8847CDD38E3"**
  
  - **#LibPlatne**
  - **$LibId = "a19374d6-b9bd-49ca-a808-a73085a7afc6"**
  - **$ContentTypeId = "0x0101007A3267621C1D5F4AAFF76806178A9E420100D377A0F795415047A92C50D743011398"**
  
  - **#LibArchivne**
  - **$LibId = "50f7f4f0-8a38-4890-acf9-a92887454ad7"**
  - **$ContentTypeId = "0x0101007A3267621C1D5F4AAFF76806178A9E4201009E8C739BAA64B84897E078085921AD24"**
  
  - **$targetList = Get-PnPList -identity $LibId**
  - **$targetContentType = get-PnPContentType -List $targetList -Identity $ContentTypeId**
  - **$targetContentType.DisplayFormClientSideComponentId = $ComponentId**
  - **$targetContentType.NewFormClientSideComponentId = $ComponentId**
  - **$targetContentType.EditFormClientSideComponentId = $ComponentId**
  - **$targetContentType.Update($false)**
  - **Invoke-PnPQuery**

## instal

// Replace these values with your own:
const listId = "16e60be6-ef8f-4477-9c2b-3ea1ada91468"; 
const formUrl = "DispForm.aspx"; // Or "EditForm.aspx"/"DispForm.aspx"
const customizerComponentId = "bfaa71b6-fe54-4c63-8952-dc4df878cbc4"; // From manifest

const digestResponse = await fetch(`${_spPageContextInfo.webAbsoluteUrl}/_api/contextinfo`, {
  method: "POST",
  headers: {
    "Accept": "application/json;odata=verbose",
    "Content-Type": "application/json;odata=verbose"
  }
});

const digestData = await digestResponse.json();
const requestDigest = digestData.d.GetContextWebInformation.FormDigestValue;

const payload = {
  ClientSideComponentId: customizerComponentId,
  ClientSideComponentProperties: "{}" // You can pass JSON stringified props if needed
};

const updateResponse = await fetch(
  `${_spPageContextInfo.webAbsoluteUrl}/_api/web/lists('${listId}')/Forms('${formUrl}')`, 
  {
    method: "POST",
    headers: {
      "Accept": "application/json;odata=verbose",
      "Content-Type": "application/json;odata=verbose",
      "X-RequestDigest": requestDigest, // Use dynamically retrieved digest token
      "IF-MATCH": "*",
      "X-HTTP-Method": "MERGE"
    },
    body: JSON.stringify(payload)
  }
);


## Features

Description of the extension that expands upon high-level summary above.

This extension illustrates the following concepts:

- topic 1
- topic 2
- topic 3

> Notice that better pictures and documentation will increase the sample usage and the value you are providing for others. Thanks for your submissions advance.

> Share your web part with others through Microsoft 365 Patterns and Practices program to get visibility and exposure. More details on the community, open-source projects and other activities from http://aka.ms/m365pnp.

## References

- [Getting started with SharePoint Framework](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/set-up-your-developer-tenant)
- [Building for Microsoft teams](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/build-for-teams-overview)
- [Use Microsoft Graph in your solution](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/web-parts/get-started/using-microsoft-graph-apis)
- [Publish SharePoint Framework applications to the Marketplace](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/publish-to-marketplace-overview)
- [Microsoft 365 Patterns and Practices](https://aka.ms/m365pnp) - Guidance, tooling, samples and open-source controls for your Microsoft 365 development
