/**
 * @AdminAuth 
 */

const CoreServices = require("../../../shared/services/core.services")
module.exports = class AdminAuthController extends CoreServices {

  constructor() {
    super()
    this.AdminAuthServices = new(require("../../admin/services/auth.admin.services"))();
    this.AdminAuthValidations = require("../../admin/validations/auth.admin.validations");
  }
  /**
   * Admin VerifyAccount
   * ******************
   * @name verifyAccount
   * @method post
   * @route  POST /admin/auth/verify-account
   * @auth   none
   * @type verifyAccount
   * @files []
   * ******************
   * 
   */
  verifyAccount = async (req, res) => {
    const {
      error
    } = this.AdminAuthValidations.VerifyAccount(req.body);

    if (error) throw new this.ValidationError(error.details[0].message);


    await this.AdminAuthServices.verifyAccount({
      email: req.body.email,
      code: req.body.code,
    })


    res.json({
      message: this.SUCCESS_MESSAGES.ACTIVATED_SUCCESSFULLY("account"),
      success: true,
    })
  };
  /**
   * Admin ResendAccountVerificationCode
   * ******************
   * @name resendAccountVerificationCode
   * @method post
   * @route  POST /admin/auth/resend-account-verification-code
   * @auth   none
   * @type resendAccountVerificationCode
   * @files []
   * ******************
   * 
   */
  resendAccountVerificationCode = async (req, res) => {
    const {
      error
    } = this.AdminAuthValidations.ResendAccountVerificationCode(req.body);

    if (error) throw new this.ValidationError(error.details[0].message);


    await this.AdminAuthServices.resendAccountVerificationCode({
      email: req.body.email,
    })


    res.json({
      message: this.SUCCESS_MESSAGES.SENDED_SUCCESSFULLY("verification code"),
      success: true,
    })
  };
  /**
   * Admin Signin
   * ******************
   * @name signin
   * @method post
   * @route  POST /admin/auth/signin
   * @auth   none
   * @type signin
   * @files []
   * ******************
   * 
   */
  signin = async (req, res) => {
    const {
      error
    } = this.AdminAuthValidations.Signin(req.body);

    if (error) throw new this.ValidationError(error.details[0].message);


    const response = await this.AdminAuthServices.signin({
      email: req.body.email,
      password: req.body.password,
    }, req.requestInfo)


    res.json({
      success: true,
      ...response
    })
  };
  /**
   * Admin RefreshToken
   * ******************
   * @name refreshToken
   * @method post
   * @route  POST /admin/auth/refresh-token
   * @auth   none
   * @type refreshToken
   * @files []
   * ******************
   * 
   */
  refreshToken = async (req, res) => {
    const {
      error
    } = this.AdminAuthValidations.RefreshToken(req.body);

    if (error) throw new this.ValidationError(error.details[0].message);


    const response = await this.AdminAuthServices.refreshToken(req.body.refreshToken, req.requestInfo)


    res.json({
      success: true,
      refreshToken: req.body.refreshToken,
      ...response
    })
  };
  /**
   * Admin ActivateMFAToken
   * ******************
   * @name activateMFAToken
   * @method post
   * @route  POST /admin/auth/activate-mfa-token
   * @auth   none
   * @type activateMFAToken
   * @files []
   * ******************
   * 
   */
  activateMFAToken = async (req, res) => {
    const {
      error
    } = this.AdminAuthValidations.ActivateMFAToken(req.body);

    if (error) throw new this.ValidationError(error.details[0].message);


    const response = await this.AdminAuthServices.activateMFAToken(
      req.body.accessToken,
      req.body.code,
    )


    res.json({
      success: true,
      ...response
    })
  };
  /**
   * Admin ResendMFACode
   * ******************
   * @name resendMFACode
   * @method post
   * @route  POST /admin/auth/resend-mfa-code
   * @auth   none
   * @type resendMFACode
   * @files []
   * ******************
   * 
   */
  resendMFACode = async (req, res) => {
    const {
      error
    } = this.AdminAuthValidations.ResendMFACode(req.body);

    if (error) throw new this.ValidationError(error.details[0].message);


    const response = await this.AdminAuthServices.resendMFACode(
      req.body.accessToken
    )


    res.json({
      success: true,
      message: "MFA code resent",
      ...response
    })
  };
  /**
   * Admin GeneratePasswordResetCode
   * ******************
   * @name generatePasswordResetCode
   * @method post
   * @route  POST /admin/auth/generate-password-restoration-code
   * @auth   none
   * @type generatePasswordResetCode
   * @files []
   * ******************
   * 
   */
  generatePasswordResetCode = async (req, res) => {
    const {
      error
    } = this.AdminAuthValidations.GeneratePasswordResetCode(req.body);

    if (error) throw new this.ValidationError(error.details[0].message);


    await this.AdminAuthServices.generatePasswordResetCode({
      email: req.body.email,
    })


    res.json({
      message: this.SUCCESS_MESSAGES.SENDED_SUCCESSFULLY("password reset code"),
      success: true,
    })
  };
  /**
   * Admin VerifyPasswordResetCode
   * ******************
   * @name verifyPasswordResetCode
   * @method post
   * @route  POST /admin/auth/verify-password-reset-code
   * @auth   none
   * @type verifyPasswordResetCode
   * @files []
   * ******************
   * 
   */
  verifyPasswordResetCode = async (req, res) => {
    const {
      error
    } = this.AdminAuthValidations.VerifyPasswordResetCode(req.body);

    if (error) throw new this.ValidationError(error.details[0].message);


    const response = await this.AdminAuthServices.verifyPasswordResetCode({
      email: req.body.email,
      code: req.body.code,
    })

    res.json({
      success: true,
      ...response
    })
  };
  /**
   * Admin ResetPassword
   * ******************
   * @name resetPassword
   * @method post
   * @route  POST /admin/auth/reset-password
   * @auth   none
   * @type resetPassword
   * @files []
   * ******************
   * 
   */
  resetPassword = async (req, res) => {
    const {
      error
    } = this.AdminAuthValidations.ResetPassword(req.body);

    if (error) throw new this.ValidationError(error.details[0].message);


    const response = await this.AdminAuthServices.resetPassword(req.body.token, req.body.password)

    res.json({
      success: true,
      ...response
    })
  };
  /**
   * Admin ChangePassword
   * ******************
   * @name changePassword
   * @method post
   * @route  POST /admin/auth/change-password
   * @auth   Actor
   * @type changePassword
   * @files []
   * ******************
   * 
   */
  changePassword = async (req, res) => {
    const {
      error
    } = this.AdminAuthValidations.ChangePassword(req.body);

    if (error) throw new this.ValidationError(error.details[0].message);


    const response = await this.AdminAuthServices.changePassword({
      id: req.actor._id,
      oldPassword: req.body.oldPassword,
      newPassword: req.body.newPassword,
    })

    res.json({
      success: true,
      ...response
    })
  };
  /**
   * Admin Signout
   * ******************
   * @name signout
   * @method post
   * @route  POST /admin/auth/signout
   * @auth   Actor
   * @type signout
   * @files []
   * ******************
   * 
   */
  signout = async (req, res) => {
    const response = await this.AdminAuthServices.signout(req.accessToken)

    res.json({
      success: true,
      ...response
    })
  };
  /**
   * Admin RedirectToGoogleAuth
   * ******************
   * @name redirectToGoogleAuth
   * @method get
   * @route  GET        /admin/auth/google/signin
   * @auth   none
   * @type redirectToGoogleAuth
   * ******************
   * 
   */
  redirectToGoogleAuth = async (req, res) => {
    const REDIRECT_URI = `${process.env.BASE_URL}/api/v1/admin/auth/google/callback`
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=profile email`;

    res.redirect(url);
  };
  /**
   * Admin GoogleCallback
   * ******************
   * @name googleCallback
   * @method get
   * @route  GET        /admin/auth/google/callback
   * @auth   none
   * @type googleCallback
   * ******************
   * 
   */
  googleCallback = async (req, res) => {
    const {
      code
    } = req.query;
    const response = await this.AdminAuthServices.implementGoogleAuth({
      code
    }, req.requestInfo)

    res.json({
      success: true,
      ...response
    })
  };
  /**
   * Admin SigninWithGoogle
   * ******************
   * @name signinWithGoogle
   * @method post
   * @route  POST        /admin/auth/google/signin
   * @auth   none
   * @type signinWithGoogle
   * ******************
   * 
   */
  signinWithGoogle = async (req, res) => {
    const {
      access_token,
      id_token
    } = req.body;
    const response = await this.AdminAuthServices.implementGoogleAuth({
      access_token,
      id_token
    }, req.requestInfo)


    res.json({
      success: true,
      ...response
    })
  };

}