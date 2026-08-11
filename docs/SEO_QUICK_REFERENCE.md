# 🚀 SEO Quick Reference Card

## Domain Information
```
Primary Domain: https://kein.in
Locale: en_IN (India)
Language: English
```

## Social Media
```
Twitter: @kein_official
Instagram: @kein_official
Facebook: @kein_official
```

## Contact Emails
```
Support: support@kein.in
Press: press@kein.in
Careers: careers@kein.in
Partners: partners@kein.in
```

## Key URLs to Test
```
Sitemap:  https://kein.in/sitemap.xml
Robots:   https://kein.in/robots.txt
Manifest: https://kein.in/manifest.json
```

## Quick Commands

### Add SEO to New Page
```typescript
import { generateMetadata } from '@/lib/seo-utils';

export const metadata = generateMetadata({
  title: 'Your Page Title',
  description: 'Your description (150-160 chars)',
  path: '/your-path',
  keywords: ['keyword1', 'keyword2'],
});
```

### Add Product Schema
```typescript
import SEOHead from '@/components/SEOHead';
import { generateProductSchema } from '@/lib/seo-utils';

const schema = generateProductSchema({
  name: product.name,
  description: product.description,
  image: product.image,
  price: product.price,
  currency: 'INR',
  brand: product.brand,
  availability: 'InStock',
});

return <SEOHead structuredData={schema} />;
```

### Add Creator Schema
```typescript
import { generateProfileSchema } from '@/lib/seo-utils';

const schema = generateProfileSchema({
  name: creator.name,
  description: creator.bio,
  image: creator.avatar,
  url: `https://kein.in/creator/${creator.username}`,
  followers: creator.followerCount,
  username: creator.username,
});
```

## Available Utilities

| Function | Purpose |
|----------|---------|
| `generateMetadata()` | Page metadata |
| `generateProductSchema()` | Product structured data |
| `generateProfileSchema()` | Creator/profile schema |
| `generateVideoSchema()` | Video/reel schema |
| `generateArticleSchema()` | Blog/article schema |
| `generateBreadcrumbSchema()` | Breadcrumb navigation |
| `generateFAQSchema()` | FAQ schema |
| `getCanonicalUrl()` | Canonical URL |
| `getSocialShareUrls()` | Social share links |

## SEO Best Practices

### ✅ Do's
- Keep titles 50-60 characters
- Write descriptions 150-160 characters
- Use descriptive alt text for images
- Include target keywords naturally
- Add schema markup to all pages
- Use clean, descriptive URLs
- Link to related content internally
- Optimize images (WebP/AVIF)
- Focus on India-specific keywords

### ❌ Don'ts
- Don't keyword stuff
- Don't use duplicate content
- Don't forget mobile optimization
- Don't ignore page speed
- Don't skip alt text
- Don't use generic descriptions
- Don't create orphan pages
- Don't forget canonical URLs

## Target Keywords Priority

### High Priority
```
1. live shopping India
2. social commerce platform
3. creator economy India
4. live streaming shopping
5. shop with creators
```

### Medium Priority
```
1. buy from live streams
2. creator marketplace India
3. social selling platform
4. shopping reels
5. influencer commerce
```

## Validation Checklist

Before launching any page:
- [ ] Unique title (50-60 chars)
- [ ] Unique description (150-160 chars)
- [ ] Canonical URL set
- [ ] Open Graph tags
- [ ] Twitter Card tags
- [ ] Schema markup added
- [ ] Images have alt text
- [ ] Links work correctly
- [ ] Mobile responsive
- [ ] Fast load time (<3s)

## Testing Tools (Quick Access)

```
Rich Results:      search.google.com/test/rich-results
Schema Validator:  validator.schema.org
Facebook Debug:    developers.facebook.com/tools/debug
Twitter Card:      cards-dev.twitter.com/validator
Mobile Test:       search.google.com/test/mobile-friendly
PageSpeed:         pagespeed.web.dev
```

## Files to Update

When adding new pages, update:
1. `app/[page]/page.tsx` - Add metadata
2. `app/sitemap.ts` - Add to sitemap (if static)
3. `lib/seo-config.ts` - Add page config (if needed)

## Emergency Contacts

If SEO issues arise:
1. Check Google Search Console
2. Review `docs/SEO_GUIDE.md`
3. Check `docs/SEO_CHECKLIST.md`
4. Validate with testing tools above

---

**Print this card and keep it handy!**  
**Last Updated**: November 9, 2025
