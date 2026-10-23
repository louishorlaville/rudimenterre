export const CUSTOMER_PHONE_QUERY = `#graphql
  query CustomerPhoneForAddress {
    customer {
      id
      phoneNumber { phoneNumber }
      defaultAddress { id }
    }
  }
`;
