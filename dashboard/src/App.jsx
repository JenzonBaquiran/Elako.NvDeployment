import React from "react";

function App() {
  return (
    <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#007bff', marginBottom: '20px' }}>🚀 Elako.Nv System</h1>
      <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', margin: '20px 0' }}>
        <h2>✅ Deployment Successful!</h2>
        <p><strong>Frontend:</strong> https://elako-nv-deployment.vercel.app</p>
        <p><strong>Backend:</strong> https://elakonvdeployment-production.up.railway.app</p>
        <p><strong>Database:</strong> MongoDB on Railway</p>
      </div>
      <div style={{ marginTop: '30px' }}>
        <h3>🎯 Next Steps:</h3>
        <p>Your system is now live! You can now:</p>
        <ul style={{ textAlign: 'left', display: 'inline-block' }}>
          <li>Access the admin dashboard</li>
          <li>Manage MSME users</li>
          <li>Handle customer interactions</li>
          <li>View analytics and reports</li>
        </ul>
      </div>
    </div>
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/terms" element={<TermsPage />} />
            
            {/* Admin Protected Routes */}
            <Route 
              path="/admin-user-management" 
              element={
                <ProtectedRoute allowedUserTypes={['admin']}>
                  <AdminUserManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin-overview" 
              element={
                <ProtectedRoute allowedUserTypes={['admin']}>
                  <AdminOverview />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin-msme-oversight" 
              element={
                <ProtectedRoute allowedUserTypes={['admin']}>
                  <AdminMsmeOversight />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin-analytics" 
              element={
                <ProtectedRoute allowedUserTypes={['admin']}>
                  <AdminAnalytics />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin-settings" 
              element={
                <ProtectedRoute allowedUserTypes={['admin']}>
                  <AdminSettings />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin-blog-management" 
              element={
                <ProtectedRoute allowedUserTypes={['admin']}>
                  <BlogManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin-audit-logs" 
              element={
                <ProtectedRoute allowedUserTypes={['admin']}>
                  <AdminAuditLogs />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin-msme-reports" 
              element={
                <ProtectedRoute allowedUserTypes={['admin']}>
                  <AdminMsmeReport />
                </ProtectedRoute>
              } 
            />

            {/* MSME Protected Routes */}
            <Route 
              path="/msme-sidebar" 
              element={
                <ProtectedRoute allowedUserTypes={['msme']}>
                  <MsmeSidebar />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/msme-dashboard" 
              element={
                <ProtectedRoute allowedUserTypes={['msme']}>
                  <MsmeDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/msme-manage-product" 
              element={
                <ProtectedRoute allowedUserTypes={['msme']}>
                  <MsmeManageProduct />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/msme-messages" 
              element={
                <ProtectedRoute allowedUserTypes={['msme']}>
                  <MsmeMessage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/msme-analytics" 
              element={
                <ProtectedRoute allowedUserTypes={['msme']}>
                  <MsmeAnalytics />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/msme-profile" 
              element={
                <ProtectedRoute allowedUserTypes={['msme']}>
                  <MsmeProfile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/msme-customize-dashboard" 
              element={
                <ProtectedRoute allowedUserTypes={['msme']}>
                  <MsmeCustomizeDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/msme-reviews" 
              element={
                <ProtectedRoute allowedUserTypes={['msme']}>
                  <MsmeReviews />
                </ProtectedRoute>
              } 
            />

            {/* Customer Protected Routes */}
            <Route 
              path="/customer-sidebar" 
              element={
                <ProtectedRoute allowedUserTypes={['customer']}>
                  <CustomerSidebar />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/customer-view-store" 
              element={
                <ProtectedRoute allowedUserTypes={['customer']}>
                  <CustomerViewStore />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/customer/stores" 
              element={
                <ProtectedRoute allowedUserTypes={['customer']}>
                  <CustomerViewStore />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/customer/store/:storeId" 
              element={
                <ProtectedRoute allowedUserTypes={['customer', 'msme', 'admin']}>
                  <CustomerStoreView />
                </ProtectedRoute>
              } 
            />
            {/* Public store viewing route */}
            <Route path="/store/:storeId" element={<CustomerStoreView />} />
            <Route 
              path="/customer-favorites" 
              element={
                <ProtectedRoute allowedUserTypes={['customer']}>
                  <CustomerFavorites />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/customer-reviews" 
              element={
                <ProtectedRoute allowedUserTypes={['customer']}>
                  <CustomerReviews />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/customer-message" 
              element={
                <ProtectedRoute allowedUserTypes={['customer']}>
                  <CustomerMessage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/customer-message/:storeId" 
              element={
                <ProtectedRoute allowedUserTypes={['customer']}>
                  <CustomerMessage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/customer-profile" 
              element={
                <ProtectedRoute allowedUserTypes={['customer']}>
                  <CustomerProfile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/customer-notifications" 
              element={
                <ProtectedRoute allowedUserTypes={['customer']}>
                  <CustomerNotifications />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/customer/hot-picks" 
              element={
                <ProtectedRoute allowedUserTypes={['customer', 'msme', 'admin']}>
                  <CustomerHotPicks />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/customer/top-stores" 
              element={
                <ProtectedRoute allowedUserTypes={['customer', 'msme', 'admin']}>
                  <CustomerTopStores />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/product/:productId" 
              element={
                <ProtectedRoute allowedUserTypes={['customer', 'msme', 'admin']}>
                  <ProductDetails />
                </ProtectedRoute>
              } 
            />
            {/* Public product viewing route */}
            <Route path="/products/:productId" element={<ProductDetails />} />
          </Routes>
        </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  );    
}
export default App;