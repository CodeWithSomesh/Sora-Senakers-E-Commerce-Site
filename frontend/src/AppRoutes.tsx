import { Navigate, Route, Routes } from "react-router-dom"
import Layout from "./layouts/layout";
import HomePage from "./pages/HomePage";
import AuthCallbackPage from "./pages/AuthCallbackPage";
import UserProfilePage from "./pages/UserProfilePage";
import ProtectedRoute from "./auth/ProtectedRoute";
import ManageShopPage from "./pages/ManageShopPage";
import SearchPage from "./pages/SearchPage";
import DetailPage from "./pages/DetailPage";
import ManageHomePageForm from "./forms/manage-shop-form/ManageHomePageForm";
import ManageProductsForm from "./forms/manage-shop-form/ManageProductsForm";
import OrderDetails from "./forms/manage-shop-form/OrderDetails";
import MenProductPage from "./pages/MenProductPage";
import WomenProductPage from "./pages/WomenProductPage";
import KidsProductPage from "./pages/KidsProductPage";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import UpdateProductDetails from "./forms/manage-shop-form/UpdateProductDetails";
import PaymentPage from "./pages/PaymentPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicy";
import TermsOfServicePage from "./pages/TermsOfService";

const AppRoutes = () => {
    return (
        <Routes>
            <Route 
                path="/" 
                element={<Layout homePage>
                    <HomePage/>
                </Layout>}
            />

            <Route path="auth-callback" element={<AuthCallbackPage/>}/>

            <Route 
                path="/menProducts" 
                element={
                    <Layout homePage={false}>
                        <MenProductPage />
                    </Layout>
                }
            />

            <Route 
                path="/womenProducts" 
                element={
                    <Layout homePage={false}>
                        <WomenProductPage />
                    </Layout>
                }
            />

            <Route 
                path="/kidsProducts" 
                element={
                    <Layout homePage={false}>
                        <KidsProductPage />
                    </Layout>
                }
            />

            <Route 
                path="/products/:id" 
                element={
                    <Layout homePage={false}>
                        <ProductDetailsPage />
                    </Layout>
                }
            />

            <Route 
                path="/search/:color" 
                element={
                    <Layout homePage={false}>
                        <SearchPage/>
                    </Layout>
                }
            />

            <Route 
                path="/detail/:shopId" 
                element={
                    <Layout homePage={false}>
                        <DetailPage/>
                    </Layout>
                }
            />

            <Route 
                path="/privacyPolicy" 
                element={
                    <Layout homePage={false}>
                        <PrivacyPolicyPage />
                    </Layout>
                }
            />
            <Route 
                path="/termsOfService" 
                element={
                    <Layout homePage={false}>
                        <TermsOfServicePage />
                    </Layout>
                }
            />

            <Route element={<ProtectedRoute/>}>
                <Route 
                    path="/products/checkout/:id" 
                    element={
                        <Layout>
                            <PaymentPage />
                        </Layout>
                    }
                />
                <Route 
                    path="/user-profile" 
                    element={
                        <Layout>
                            <UserProfilePage/>
                        </Layout>
                    }
                />
                <Route 
                    path="/user-profile/:productID" 
                    element={
                        <Layout>
                            <UserProfilePage/>
                        </Layout>
                    }
                />
                <Route 
                    path="/admin/manageHomePage" 
                    element={
                        <Layout adminPage={true} >
                            <ManageHomePageForm />
                        </Layout>
                    }
                />
                <Route 
                    path="/admin/addProducts" 
                    element={
                        <Layout adminPage={true} >
                            <ManageShopPage />
                        </Layout>
                    }
                />
                <Route 
                    path="/admin/manageProducts" 
                    element={
                        <Layout adminPage={true} >
                            <ManageProductsForm />
                        </Layout>
                    }
                />
                <Route 
                    path="/admin/manageProducts/update/:id" 
                    element={
                        <Layout adminPage={true} >
                            <ManageShopPage />
                        </Layout>
                    }
                />
                <Route 
                    path="/admin/orderDetails" 
                    element={
                        <Layout adminPage={true} >
                            <OrderDetails />
                        </Layout>
                    }
                />
            </Route>
            
            <Route path="*" element={<Navigate to="/" />}/>
        </Routes>
    );
};

export default AppRoutes