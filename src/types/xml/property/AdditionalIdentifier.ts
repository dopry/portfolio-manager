// ex) IAdditionIdentifierType
//  {
//     '@_id': '1',
//     '@_standardApproved': 'false',
//     '@_name': 'Custom ID 1',
//     '@_description': 'Custom ID 1'
//   },
export interface IAdditionIdentifierType {
    '@_id': string;
    '@_standardApproved': string;
    '@_name': string;
    '@_description': string;
}

export interface IAdditionalIdentifierTypes {
    additionalIdentifierType: IAdditionIdentifierType[];
}

// {
//   additionalIdentifierType: {
//     '@_id': '1',
//     '@_standardApproved': 'false',
//     '@_name': 'Custom ID 1',
//     '@_description': 'Custom ID 1'
//   },
//   description: 'RossEnergy',
//   value: '?spacetype={spacetype}&fuelsource={fuelsource}&baseload={baseload}&heating={heating}&cooling={cooling}',
//   '@_id': '2391167'
// }
export interface IAdditionalIdentifier {
    '@_id': string;
    additionalIdentifierType: IAdditionIdentifierType;
    description: string;
    value: string;
}

export interface IAdditionalIdentifiers {
    additionalIdentifier: IAdditionalIdentifier[];
}