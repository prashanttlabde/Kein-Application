# Environment Variables for SEO & Analytics

This file contains instructions for setting up SEO and analytics environment variables.

## Required Environment Variables

### 1. Google Search Console Verification

```env
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=your-google-verification-code
```

**How to get it:**
1. Go to [Google Search Console](https://search.google.com/search-console)
2. Click "Add property" and enter `https://kein.in`
3. Choose "HTML tag" verification method
4. Copy the `content` value from the meta tag
5. Add it to your `.env.local` file

### 2. Bing Webmaster Tools Verification

```env
NEXT_PUBLIC_BING_SITE_VERIFICATION=your-bing-verification-code
```

**How to get it:**
1. Go to [Bing Webmaster Tools](https://www.bing.com/webmasters)
2. Sign in and add your site
3. Choose "Meta tag" verification method
4. Copy the `content` value
5. Add it to your `.env.local` file

### 3. Google Analytics 4 (GA4)

```env
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

**How to get it:**
1. Go to [Google Analytics](https://analytics.google.com)
2. Create a new GA4 property or select existing
3. Go to Admin → Data Streams → Web
4. Copy your Measurement ID (format: `G-XXXXXXXXXX`)
5. Add it to your `.env.local` file

## Example .env.local File

Create a `.env.local` file in your project root with:

```env
# SEO Verification
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=abc123xyz456
NEXT_PUBLIC_BING_SITE_VERIFICATION=def789uvw012

# Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-ABC123DEF4

# Your existing Supabase config
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
```

## Testing

After adding these variables:

1. Restart your development server
2. Check browser console for GA4 initialization
3. Verify meta tags in page source:
   - `<meta name="google-site-verification" content="..." />`
   - `<meta name="msvalidate.01" content="..." />`
4. Submit sitemap to both search engines:
   - Google: `https://kein.in/sitemap.xml`
   - Bing: `https://kein.in/sitemap.xml`

## Production Deployment

For Railway/Vercel/other platforms:

1. Add environment variables in platform dashboard
2. Redeploy your application
3. Verify in production that:
   - GA4 is tracking pageviews
   - Meta verification tags are present
   - Search consoles can verify ownership
