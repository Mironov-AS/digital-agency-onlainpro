import { beforeEach, describe, it, expect, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import App from './App.jsx'

describe('App', () => {
  beforeEach(() => {
    window.history.pushState({}, '', '/')
    window.scrollTo = vi.fn()
    window.HTMLElement.prototype.scrollIntoView = vi.fn()
  })

  it('renders header with navigation', () => {
    render(<App />)
    const logo = document.querySelector('.logo')
    expect(logo).toBeTruthy()
    expect(logo.textContent).toContain('Цифровое агентство')
    expect(logo.textContent).toContain('ОнлайнПро.РФ')
  })

  it('renders Skills section with all 5 skills', () => {
    render(<App />)
    expect(screen.getByText('Наши ключевые навыки')).toBeTruthy()
    expect(screen.getByText('Найдём точки роста вашего бизнеса')).toBeTruthy()
    expect(screen.getByText('Запустим MVP за 2 недели')).toBeTruthy()
    expect(screen.getByText('Соберём команду под вашу задачу')).toBeTruthy()
    expect(screen.getByText('Автоматизируем рутину и сэкономим время')).toBeTruthy()
    expect(screen.getByText('Внедрим ИИ, который работает уже сейчас')).toBeTruthy()
  })

  it('renders WhyUs section', () => {
    render(<App />)
    expect(screen.getByText('Почему выбирают нас')).toBeTruthy()
    expect(screen.getByText('15+ лет создаём цифровые продукты')).toBeTruthy()
  })

  it('renders OurServices section', () => {
    render(<App />)
    expect(screen.getByText('Наши услуги')).toBeTruthy()
  })

  it('renders Contacts section', () => {
    render(<App />)
    const contactsSection = document.getElementById('contacts')
    expect(contactsSection).toBeTruthy()
    expect(screen.getByText(/Andrey\.OnlinePro@yandex\.ru/i)).toBeTruthy()
  })

  it('navigation has all required links', () => {
    render(<App />)
    const nav = document.querySelector('.nav')
    expect(nav.textContent).toContain('Навыки')
    expect(nav.textContent).toContain('Цены')
    expect(nav.textContent).toContain('О нас')
    expect(nav.textContent).toContain('Услуги')
    expect(nav.textContent).toContain('Продукты')
    expect(nav.textContent).toContain('Контакты')
  })

  it('navigates from product page to contacts section on the landing page', async () => {
    window.history.pushState({}, '', '/product/queue')
    render(<App />)

    const contactsLink = document.querySelector('.nav a[href="/#contacts"]')
    fireEvent.click(contactsLink)

    await waitFor(() => {
      expect(window.location.pathname).toBe('/')
      expect(window.location.hash).toBe('#contacts')
      expect(document.getElementById('contacts').scrollIntoView).toHaveBeenCalledWith({ block: 'start' })
    })
  })
})
