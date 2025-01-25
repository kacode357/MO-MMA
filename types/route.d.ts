type RootStackParamList = {
    Splash: undefined;
    Login: undefined;
    Detail: {id : number; title: string; star: number} ;
    HomePos: undefined;
    Foods: undefined;
    Category: undefined;
    Orders: undefined;
    PaymentOptionsScreen: undefined |  PaymentScreenProps['route']['params'];
    CashPaymentScreen: undefined |  PaymentScreenProps['route']['params'];
    VNPayPaymentScreen: undefined |  PaymentScreenProps['route']['params'];
    Reports: undefined;
    Settings: undefined;
    CartDetails: { cart: CartData };
    PosMachine: undefined;
};
