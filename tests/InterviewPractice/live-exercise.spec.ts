import { test, expect } from '@playwright/test';
import { BASE_URL } from "../proposal/constants";

test.describe('Checkouit page ', () => {
  test.beforeEach(async ({ page }) => {
    //Per4fom login 
    await page.goto("/login");
    const emailInput = page.getByTestId("email-input");
    const passwordInput = page.getByTestId("password-input");
    const loginButton = page.getByTestId("login-button");

     const product = page.getByTestId("add-to-cart-101");
     const cartIcon = page.getByTestId("cart-icon");



     /**
      * Clicking data-testid="add-to-cart-101" adds it to the cart (cart icon data-testid="cart-icon" updates a badge count, but you don't need to check that for this exercise).
Clicking the cart icon navigates to /checkout, where the promo code f
      * 
      */
    await  expect(loginButton).toBeVisible();

    await emailInput.fill("buyer@example.com");
    await passwordInput.fill("Test1234!");
    await loginButton.click();

    await expect(page.url()).toContain("/dashboard");
   //Go to checkout 
    await product.click();

    await cartIcon.click();
    await expect(page.url()).toContain("/checkout");
  });

  
  const getFields = (page: import('@playwright/test').Page) => ({
    promoCodeInput: page.getByTestId("promo-code-input"),
    applyCodeOButton:  page.getByTestId("apply-promo-button"),
    succesMessage: page.getByTestId("promo-success-message"),
    errorMessage :  page.getByTestId("promo-error-message"),
    cartTotal : page.getByTestId("cart-total")
    /**
     * 
     * Button: data-testid="apply-promo-button"
On success, a data-testid="cart-total" element updates, and a data-testid="promo-success-message" element appears with text "Promo applied".
On an invalid code, a data-testid="promo-error-message" element appears with text "Invalid promo code" and the cart total does not change.
The cart starts at $100.00. A valid code SAVE10 should bring the total to $90.00.
An invalid code is FAKE20.
     */
  });

  test('Applying a valid promo code updates the total correctly and shows the success message.', async ({ page }) => {
      await getFields(page).promoCodeInput.fill("SAVE10");
       await getFields(page).applyCodeOButton.click();
       
       await expect(getFields(page).cartTotal).toHaveText("$90.00");
       await expect(getFields(page).succesMessage).toBeVisible()
       await expect(getFields(page).succesMessage).toHaveText("Promo applied");
   });

  test('Applying an invalid promo code  and shows the error message', async ({ page }) => {
    const { promoCodeInput, applyCodeOButton, errorMessage,cartTotal } = getFields(page);
     await promoCodeInput.fill("FAKE20");
       await applyCodeOButton.click();
       
       await expect(cartTotal).toHaveText("$100.00");
       await expect(errorMessage).toBeVisible();
       await expect(errorMessage).toHaveText("Invalid promo code");
  });

});
