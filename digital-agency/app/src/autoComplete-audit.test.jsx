import { describe, expect, it } from 'vitest'
import fs from 'fs'
import path from 'path'

const APP_SRC = path.resolve(__dirname, '.')

function findJsxFiles(dir) {
  const results = []
  try {
    const items = fs.readdirSync(dir, { withFileTypes: true })
    for (const item of items) {
      const full = path.join(dir, item.name)
      if (item.isDirectory() && !item.name.includes('node_modules') && !item.name.includes('test')) {
        results.push(...findJsxFiles(full))
      } else if (item.name.endsWith('.jsx') && !item.name.includes('.test.')) {
        results.push(full)
      }
    }
  } catch {}
  return results
}

function extractFormElements(content) {
  const issues = []
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const lineNum = i + 1

    let element = null
    if (line.match(/<input\s/)) {
      if (line.includes('type="checkbox"') || line.includes("type='checkbox'")) continue
      if (line.includes('type="radio"') || line.includes("type='radio'")) continue
      if (line.includes('type="file"') || line.includes("type='file'")) continue
      if (line.includes('type="hidden"') || line.includes("type='hidden'")) continue
      if (line.includes('type="range"') || line.includes("type='range'")) continue
      if (line.includes('disabled')) continue
      element = 'input'
    } else if (line.match(/<textarea[\s>]/)) {
      element = 'textarea'
    } else if (line.match(/<select\s/)) {
      element = 'select'
    }

    if (!element) continue

    let tagBlock = line
    for (let j = i + 1; j < Math.min(i + 10, lines.length); j++) {
      tagBlock += ' ' + lines[j]
      if (lines[j].includes('/>')) break
      if (lines[j].trimStart().startsWith('<') && !lines[j].includes('{')) break
    }

    if (!tagBlock.includes('autoComplete=') && !tagBlock.includes('autocomplete=')) {
      issues.push({ lineNum, element, line: line.trim() })
    }
  }

  return issues
}

describe('AutoComplete audit — все JSX файлы', () => {
  const jsxFiles = findJsxFiles(APP_SRC)

  it('находит JSX файлы для аудита', () => {
    expect(jsxFiles.length).toBeGreaterThan(0)
  })

  for (const filePath of jsxFiles) {
    const relative = path.relative(APP_SRC, filePath)

    it(`${relative} — все form элементы имеют autoComplete`, () => {
      const content = fs.readFileSync(filePath, 'utf-8')
      const issues = extractFormElements(content)

      if (issues.length > 0) {
        const report = issues.map(i =>
          `  Line ${i.lineNum}: <${i.element}> missing autoComplete`
        ).join('\n')
        expect(issues, `Missing autoComplete:\n${report}`).toHaveLength(0)
      }
    })
  }
})
