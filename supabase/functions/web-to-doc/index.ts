import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { DOMParser, Element } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { url } = await req.json()
    if (!url) {
      throw new Error('URL is required')
    }

    console.log(`正在抓取 URL: ${url}`)
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
      }
    })

    if (!response.ok) {
      throw new Error(`无法获取页面内容: ${response.statusText}`)
    }

    const html = await response.text()
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')

    if (!doc) {
      throw new Error('无法解析 HTML 内容')
    }

    // 1. 获取标题
    const title = doc.querySelector('title')?.textContent?.trim() || '抓取到的文档'

    // 2. 寻找内容区域
    let contentElement: Element | null = null

    // 针对微信公众号优化
    if (url.includes('mp.weixin.qq.com')) {
      contentElement = doc.querySelector('#js_content')
    } 
    
    // 通用逻辑：尝试常见的正文容器
    if (!contentElement) {
      const selectors = [
        'article', 
        '.article-content', 
        '.post-content', 
        '.entry-content', 
        '.main-content',
        'main',
        '#content',
        '.content'
      ]
      for (const selector of selectors) {
        contentElement = doc.querySelector(selector)
        if (contentElement) break
      }
    }

    // 兜底：如果找不到特定区域，则使用 body
    if (!contentElement) {
      contentElement = doc.body
    }

    if (!contentElement) {
      throw new Error('无法提取网页内容区域')
    }

    // 3. 清理内容
    const cleanup = (el: Element) => {
      // 移除无关标签
      const tagsToRemove = ['script', 'style', 'noscript', 'iframe', 'header', 'footer', 'nav', 'aside', 'button', 'form']
      tagsToRemove.forEach(tag => {
        el.querySelectorAll(tag).forEach(item => item.remove())
      })

      // 处理图片
      el.querySelectorAll('img').forEach(img => {
        const imageElement = img as Element
        // 处理懒加载属性 (常见于微信等平台)
        const dataSrc = imageElement.getAttribute('data-src') || imageElement.getAttribute('data-original-src')
        if (dataSrc) {
          imageElement.setAttribute('src', dataSrc)
        }

        // 补全相对路径
        const src = imageElement.getAttribute('src')
        if (src && !src.startsWith('http') && !src.startsWith('data:')) {
          try {
            const baseUrl = new URL(url)
            imageElement.setAttribute('src', new URL(src, baseUrl.origin).toString())
          } catch (e) {
            console.error('修复图片路径失败:', e)
          }
        }

        // 移除微信图片的特殊样式导致的无法显示
        imageElement.removeAttribute('data-w')
        imageElement.removeAttribute('data-h')
        imageElement.removeAttribute('data-type')
        imageElement.removeAttribute('data-fmt')
        imageElement.style.maxWidth = '100%'
        imageElement.style.height = 'auto'
        imageElement.style.display = 'block'
        imageElement.style.margin = '10px auto'
      })

      // 处理链接：转换为绝对路径
      el.querySelectorAll('a').forEach(a => {
        const anchor = a as Element
        const href = anchor.getAttribute('href')
        if (href && !href.startsWith('http') && !href.startsWith('javascript') && !href.startsWith('#')) {
          try {
            const baseUrl = new URL(url)
            anchor.setAttribute('href', new URL(href, baseUrl.origin).toString())
          } catch (e) {
            // 忽略
          }
        }
      })

      // 移除所有内联事件和危险属性
      const allElements = el.querySelectorAll('*')
      allElements.forEach(node => {
        const element = node as Element
        // 移除所有以 on 开头的属性 (onclick, onload 等)
        for (const attr of Array.from(element.attributes)) {
          if (attr.name.startsWith('on')) {
            element.removeAttribute(attr.name)
          }
        }
      })
    }

    cleanup(contentElement)

    // 4. 返回处理后的 HTML 内容
    let resultHtml = contentElement.innerHTML

    // 进一步精简微信的 HTML (微信 HTML 特别冗杂)
    if (url.includes('mp.weixin.qq.com')) {
      // 微信内容通常被包裹在很多 div 中，有时候由于 visibility: hidden 导致不显示
      resultHtml = resultHtml.replace(/visibility: hidden/gi, "visibility: visible")
    }

    return new Response(
      JSON.stringify({ 
        title,
        content: resultHtml
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error(`抓取错误: ${error.message}`)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})
