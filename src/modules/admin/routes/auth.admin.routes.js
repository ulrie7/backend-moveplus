/**
 * @AdminAuth 
 */


const ParentRoute = require("../../../routes/route.parent")
const SwaggerRouteBuilder = require("../../../shared/lib/swagger/SwaggerRouteBuilder")
module.exports = class AdminAuthRoutes extends ParentRoute {

  constructor() {
    super()


    // Controller initialization 
    const adminauthcontroller = new(require("../../admin/controllers/auth.admin.controller"))();

    // Initialize the express router
    const router = this.express.Router();


    /**
     * @swagger
     * tags:
     *   name: Admin
     *   description: Admin auth routes
     */
    const swaggerBuilder = new SwaggerRouteBuilder('Admin');


    // Route: Verify Admin Account
    swaggerBuilder.addRoute('/api/v1/admin/auth/verify-account', 'post', 'Verify admin account', ['AdminAuth'])
      .addRequestBody('#/components/schemas/VerifyAdminAccountPayload', 'Verify Admin Account')
      .addResponse(201, 'Account verified', '#/components/schemas/VerifyAdminAccountResponse')
      .addResponse(400, 'Bad request');

    router.route("/verify-account").post(this.use(adminauthcontroller.verifyAccount));

    // Route: Resend Admin Account Verification Code
    swaggerBuilder.addRoute('/api/v1/admin/auth/resend-account-verification-code', 'post', 'Resend admin account verification code', ['AdminAuth'])
      .addRequestBody('#/components/schemas/ResendAdminAccountVerificationCodePayload', 'Resend Admin Account Verification Code')
      .addResponse(201, 'Account verification code resent successfully', '#/components/schemas/ResendAdminAccountVerificationCodeResponse')
      .addResponse(400, 'Bad request');

    router.route("/resend-account-verification-code").post(this.use(adminauthcontroller.resendAccountVerificationCode));

    // Route: Sign in Admin
    swaggerBuilder.addRoute('/api/v1/admin/auth/signin', 'post', 'Sign in admin', ['AdminAuth'])
      .addRequestBody('#/components/schemas/SigninAdminPayload', 'Sign in Admin')
      .addResponse(201, 'Signin successfully', '#/components/schemas/SigninAdminResponse')
      .addResponse(400, 'Bad request');

    router.route("/signin").post(this.use(adminauthcontroller.signin));

    // Route: Activate Admin MFA Token
    swaggerBuilder.addRoute('/api/v1/admin/auth/activate-mfa-token', 'post', 'Activate admin MFA token', ['AdminAuth'])
      .addRequestBody('#/components/schemas/ActivateAdminMfaTokenPayload', 'Activate Admin MFA Token')
      .addResponse(201, 'MFA token activated successfully', '#/components/schemas/ActivateAdminMfaTokenResponse')
      .addResponse(400, 'Bad request');

    router.route("/activate-mfa-token").post(this.use(adminauthcontroller.activateMFAToken));

    // Route: Resend Admin MFA Code
    swaggerBuilder.addRoute('/api/v1/admin/auth/resend-mfa-code', 'post', 'Resend admin MFA code', ['AdminAuth'])
      .addRequestBody('#/components/schemas/ResendAdminMfaCodePayload', 'Resend Admin MFA Code')
      .addResponse(201, 'MFA code resent successfully', '#/components/schemas/ResendAdminMfaCodeResponse')
      .addResponse(400, 'Bad request');

    router.route("/resend-mfa-code").post(this.use(adminauthcontroller.resendMFACode));

    // Route: Refresh Admin Token
    swaggerBuilder.addRoute('/api/v1/admin/auth/refresh-token', 'post', 'Refresh admin token', ['AdminAuth'])
      .addRequestBody('#/components/schemas/RefreshAdminTokenPayload', 'Refresh Admin Token')
      .addResponse(201, 'Token refreshed successfully', '#/components/schemas/RefreshAdminTokenResponse')
      .addResponse(400, 'Bad request');

    router.route("/refresh-token").post(this.use(adminauthcontroller.refreshToken));

    // Route: Generate Admin Password Restoration Code
    swaggerBuilder.addRoute('/api/v1/admin/auth/generate-password-restoration-code', 'post', 'Generate admin password restoration code', ['AdminAuth'])
      .addRequestBody('#/components/schemas/GenerateAdminPasswordRestorationCodePayload', 'Generate Admin Password Restoration Code')
      .addResponse(201, 'Password restoration code generated successfully', '#/components/schemas/GenerateAdminPasswordRestorationCodeResponse')
      .addResponse(400, 'Bad request');

    router.route("/generate-password-restoration-code").post(this.use(adminauthcontroller.generatePasswordResetCode));

    // Route: Verify Admin Password Reset Code
    swaggerBuilder.addRoute('/api/v1/admin/auth/verify-password-reset-code', 'post', 'Verify admin password reset code', ['AdminAuth'])
      .addRequestBody('#/components/schemas/VerifyAdminPasswordResetCodePayload', 'Verify Admin Password Reset Code')
      .addResponse(201, 'Password reset code verified', '#/components/schemas/VerifyAdminPasswordResetCodeResponse')
      .addResponse(400, 'Bad request');

    router.route("/verify-password-reset-code").post(this.use(adminauthcontroller.verifyPasswordResetCode));

    // Route: Admin Reset Password
    swaggerBuilder.addRoute('/api/v1/admin/auth/reset-password', 'post', 'Reset admin password', ['AdminAuth'])
      .addRequestBody('#/components/schemas/ResetAdminPasswordPayload', 'Reset Admin Password')
      .addResponse(201, 'Password reset successfully', '#/components/schemas/ResetAdminPasswordResponse')
      .addResponse(400, 'Bad request');

    router.route("/reset-password").post(this.use(adminauthcontroller.resetPassword));

    // Route: Admin Change Password
    swaggerBuilder.addRoute('/api/v1/admin/auth/change-password', 'post', 'Change admin password', ['AdminAuth'])
      .addRequestBody('#/components/schemas/ChangeAdminPasswordPayload', 'Change Admin Password')
      .addResponse(201, 'Password changed successfully', '#/components/schemas/ChangeAdminPasswordResponse')
      .addResponse(400, 'Bad request');

    router.route("/change-password").post(this.auth.authenticate(), this.use(adminauthcontroller.changePassword));

    // Route: Signout Admin 
    swaggerBuilder.addRoute('/api/v1/admin/auth/signout', 'post', 'Signout admin', ['AdminAuth'])
      .addResponse(201, 'Signout successfully', '#/components/schemas/SignoutAdminResponse')
      .addResponse(400, 'Bad request');

    router.route("/signout").post(this.auth.authenticate(), this.use(adminauthcontroller.signout));

    // Route: Google Sign in Admin
    swaggerBuilder.addRoute('/api/v1/admin/auth/google/signin', 'get', 'Google sign in admin', ['AdminAuth'])
      .addResponse(201, 'Signed in via Google successfully', '#/components/schemas/GoogleAdminSigninResponse')
      .addResponse(400, 'Bad request');

    router.route("/google/signin").get(this.use(adminauthcontroller.redirectToGoogleAuth));

    // Route: Google Admin Callback
    swaggerBuilder.addRoute('/api/v1/admin/auth/google/callback', 'post', 'Google admin callback', ['AdminAuth'])
      .addRequestBody('#/components/schemas/GoogleAdminCallbackPayload', 'Google Admin Callback')
      .addResponse(201, 'Google callback processed successfully', '#/components/schemas/GoogleAdminCallbackResponse')
      .addResponse(400, 'Bad request');

    router.route("/google/callback").get(this.use(adminauthcontroller.googleCallback));

    // Route: Admin Sign-in with Google tokens (id_token / access_token)
    swaggerBuilder.addRoute('/api/v1/admin/auth/google/signin', 'post', 'Authenticate admin using Google tokens', ['AdminAuth'])
      .addRequestBody('#/components/schemas/AdminSigninWithGooglePayload', 'Google authentication tokens')
      .addResponse(201, 'Google callback processed successfully', '#/components/schemas/GoogleAdminCallbackResponse')
      .addResponse(400, 'Invalid Google tokens provided');

    router.route("/google/signin").post(this.use(adminauthcontroller.signinWithGoogle));

    // Save Swagger routes to module spec folder
    swaggerBuilder.saveToModuleSpecFolder('admin', 'auth.admin')

    return router
  }
}