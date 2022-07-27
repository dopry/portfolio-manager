import { IAudit } from "./IAudit";


export interface UseAttributeBase {
    audit?: IAudit;
    id?: number;
    currentAsOf?: Date; // >The date that the characteristic is current as of.
    "@_temporary"?: boolean; // The characteristic is a temporary value (true/false)
    /*
        Indicates whether the value for this characteristic was calculated by the system
        using default values (Yes, No, or N/A). If the characteristic is required for benchmarking and the value is being defaulted then it is set to Yes otherwise No.  If the
        characteristic is not required for benchmarking then it is set to N/A. This attribute only applies to retrieving data.  It will be ignored if provided as input.
        Also note that even though gross floor area is required for benchmarking, it is set to No since the system never provides a value for that characteristic.
    */
    "@_default"?: "Yes" | "No" | "N/A"; // 
}
