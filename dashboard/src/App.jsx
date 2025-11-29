// This file redirects to the full application
// The actual app is in App.full.jsx
export { default } from './App.full.jsx';
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