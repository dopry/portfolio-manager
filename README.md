# Unofficial Energy Star Portfolio Manager SDK and CLI Tool

**1.x is unstable and will have breaking changes as the architecture stabilizes. 2.x will signal the beginning of proper semantic releases.**

Portfolio Manager is an important benchmarking tool to support measure and verification of energy efficiency projects. It support a number of federal incentive programs, federal decision making, and Energy Star building certifications. It is primarily used by [large companies](https://www.energystar.gov/buildings/facility-owners-and-managers/existing-buildings/save-energy/expert-help/find-spp/most_active#).

A core aim of this project is to make Portfolio Manager more accessible to smaller consulants, engineering firms, property managers, utilities like rural coops, and building owners.

The CLI tool enables automation of data flows using shell scripts popular with general IT personell and systems administrators.

The Node.JS SDK make the platform more accessible to javascript developers and is a popular technology among start ups and web developers.

## Contributing

I'm actively looking for contributors and sponsors to further develop this project. My goal is to build open-source tooling that supports the operations of companies working in the energy efficiency space.


## CLI

```
npm install portfolio-manager

# You'll need to create a portfolio manager account with live data access to make use of this cli tool.
# none of the create features for the CLI are implemented yet, so the

export PM_USERNAME="UserName"
# I strongly recomment you set the password in the environment rather than passing it on the
# cli. This will preven your password from being in `ps` lists on multiuser machines.
# It's still not super secure as it will be in /proc/env so you should only use the cli tool
# on secured machines at this juncture. I'd love help from someone who knows the best way to
# securely pass a password to commander.js.
export PM_PASSWORD="Password"

# export PM_ENDPOINT="https://portfoliomanager.energystar.gov/wstest/"
# you can set the endpoint to the testing environment, unfortunately there is no
# data there by default and there are no create functions implemented in the cli
# yet. So there isn't much you can do with it.

npx run portfolio-manager --help
```


## SDK
There isn't a docs framework yet, prioritize reading the source code over any documentation here.

The interfaces are not yet complete, I'm actively looking for contributors and sponsors to help complete the project.

### quickstart

```typescript
const endpoint = "https://portfoliomanager.energystar.gov/wstest/"
const username = "<UserName>"
const password = "<Password>"


async function main() {
    const api = new PortfolioManagerApi(endpoint, username, password)
    const pm = new PortfolioManager(api)
    const properties = await pm.getProperties()
    console.log(properties)
}
main()

```
### Interfaces


```typescript
class PortfolioManager {
    // Developer Friendly Facade to the Portfolio Manager API
    constructor(api: PortfolioManagerApi) {}

    async getAccount(): Promise<IAccount>
    async getAccountId(): Promise<number>
    async getMeter(meterId: number): Promise<IMeter>
    async getMeterConsumption(meterId: number, startDate?: Date, endDate?: Date): Promise<(IMeterDelivery | IMeterConsumption)[]>
    async getMeterLinks(propertyId: number, myAccessOnly?: boolean): Promise<ILink[]>
    async getMeters(propertyId: number): Promise<IMeter[]>
    async getAssociatedMeters(propertyId: number): Promise<IMeterPropertyAssociationList>
    async getProperty(propertyId: number): Promise<IClientProperty>
    async getPropertyLinks(accountId?: number): Promise<ILink[]>
    async getProperties(accountId?: number): Promise<IClientProperty[]>
}



class PortfolioManagerApi {
    // Typed Gateway to the Portfolio Manager API
    constructor(endpoint: string, username: string, password: string)

    async getAccount(): Promise<IGetAccountResponse>
    async getMeter(meterId: number): Promise<IGetMeterResponse>
    async getProperty(propertyId: number): Promise<IGetPropertyResponse>
    async postProperty(property: IProperty, accountId: number): Promise<IPostPropertyResponse>
    async getPropertyList(accountId: number): Promise<IGetPropertyListResponse>
    async postPropertyMeter(propertyId: number, meter: IMeter): Promise<IPostPropertyMeterResponse>
    async getPropertyMeterAssociationList(propertyId: number): Promise<IGetPropertyMeterAssociationListResponse>
    async getPropertyMeterList(propertyId: number, myAccessOnly = false): Promise<IGetPropertyMeterListResponse>
    async getMeterConsumptionData(meterId: number, page?: number, startDate?: Date, endDate?: Date): Promise<IGetMeterConsumptionResponse>
}

```


## Energy Star Portfolio Manager Upstream API Documentation
* [Getting Started](https://portfoliomanager.energystar.gov/webservices/home)
* [API Documentation](https://portfoliomanager.energystar.gov/webservices/home/api)
* [Error Codes](https://portfoliomanager.energystar.gov/webservices/home/errors)


## Sponsors
[![Ross Energy Consulting](http://www.rossenergyllc.com/blog/wp-content/uploads/2015/05/Ross-Energy-Logo-web.png)](https://www.rossenergyllc.com/)

Ross Energy Consulting initially sponsored the work on this project to support their [Strategic Energy Management](https://www.rossenergyllc.com/services/sem/) service.

>Ross Energy is dedicated to helping our clients achieve energy security for their buildings and communities. We will help your building become more comfortable and efficient, as well as more resilient to extreme weather events. Our staff has experience in over fifty million square feet of buildings, including clients such as the United States Environmental Protection Agency (EPA), Department of Defense (DoD), the Guggenheim Museum and well over 50 real estate developers and property management firms.
We proudly focus our services on the greater New York, New Jersey and Pennsylvania Tri-state area, and we are actively growing. Our expertise lies in multifamily and commercial properties.
