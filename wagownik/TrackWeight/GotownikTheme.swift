//
//  GotownikTheme.swift
//  TrackWeight
//

import SwiftUI

// MARK: - Colors (converted from OKLCH in globals.css)

extension Color {
    // Primary golden/amber — oklch(0.852 0.199 91.936)
    static let gotownikPrimary = Color(red: 0.918, green: 0.769, blue: 0.208)

    // Primary foreground (dark golden brown) — oklch(0.421 0.095 57.708)
    static let gotownikPrimaryForeground = Color(red: 0.447, green: 0.314, blue: 0.165)

    // Darker amber — oklch(0.769 0.188 70.08)
    static let gotownikAmber = Color(red: 0.831, green: 0.580, blue: 0.145)

    // Light golden — oklch(0.879 0.169 91.605)
    static let gotownikLightGold = Color(red: 0.918, green: 0.796, blue: 0.290)

    // Destructive/warning — oklch(0.577 0.245 27.325)
    static let gotownikDestructive = Color(red: 0.776, green: 0.220, blue: 0.173)

    // Muted background — oklch(0.96 0.003 325.6)
    static let gotownikMuted = Color(red: 0.949, green: 0.945, blue: 0.950)

    // Muted foreground — oklch(0.542 0.034 322.5)
    static let gotownikMutedForeground = Color(red: 0.557, green: 0.502, blue: 0.537)

    // Border — oklch(0.922 0.005 325.62)
    static let gotownikBorder = Color(red: 0.914, green: 0.906, blue: 0.912)

    // Dark amber — oklch(0.555 0.163 48.998)
    static let gotownikDarkAmber = Color(red: 0.600, green: 0.365, blue: 0.098)

    // Secondary background — oklch(0.967 0.001 286.375)
    static let gotownikSecondary = Color(red: 0.960, green: 0.958, blue: 0.964)
}

// MARK: - Button Styles

struct GotownikButtonStyle: ButtonStyle {
    var size: ButtonSize = .default
    var variant: ButtonVariant = .primary

    enum ButtonSize {
        case small, `default`, large
    }

    enum ButtonVariant {
        case primary, secondary, ghost
    }

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.system(size: fontSize, weight: .semibold))
            .foregroundStyle(foregroundColor)
            .padding(.horizontal, horizontalPadding)
            .frame(height: height)
            .background(background(isPressed: configuration.isPressed))
            .clipShape(Capsule())
            .overlay(overlayBorder)
            .scaleEffect(configuration.isPressed ? 0.97 : 1.0)
            .opacity(configuration.isPressed ? 0.9 : 1.0)
            .animation(.easeOut(duration: 0.12), value: configuration.isPressed)
    }

    @ViewBuilder
    private func background(isPressed: Bool) -> some View {
        switch variant {
        case .primary:
            Capsule().fill(Color.gotownikPrimary)
        case .secondary:
            Capsule().fill(Color.gotownikSecondary)
        case .ghost:
            Capsule().fill(isPressed ? Color.gotownikMuted : Color.clear)
        }
    }

    @ViewBuilder
    private var overlayBorder: some View {
        switch variant {
        case .secondary:
            Capsule().stroke(Color.gotownikBorder, lineWidth: 1)
        default:
            EmptyView()
        }
    }

    private var foregroundColor: Color {
        switch variant {
        case .primary: return .gotownikPrimaryForeground
        case .secondary: return .primary
        case .ghost: return .primary
        }
    }

    private var height: CGFloat {
        switch size {
        case .small: return 32
        case .default: return 40
        case .large: return 48
        }
    }

    private var fontSize: CGFloat {
        switch size {
        case .small: return 13
        case .default: return 15
        case .large: return 16
        }
    }

    private var horizontalPadding: CGFloat {
        switch size {
        case .small: return 14
        case .default: return 20
        case .large: return 28
        }
    }
}

// MARK: - Card Modifier

struct GotownikCard: ViewModifier {
    func body(content: Content) -> some View {
        content
            .background(
                RoundedRectangle(cornerRadius: 12)
                    .fill(Color(.controlBackgroundColor))
            )
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(Color.gotownikBorder.opacity(0.6), lineWidth: 1)
            )
            .shadow(color: .black.opacity(0.02), radius: 1, x: 0, y: 1)
            .shadow(color: .black.opacity(0.04), radius: 8, x: 0, y: 4)
    }
}

extension View {
    func gotownikCard() -> some View {
        modifier(GotownikCard())
    }
}

// MARK: - Smooth entrance animation

struct SlideUpFade: ViewModifier {
    let delay: Double
    @State private var appeared = false

    func body(content: Content) -> some View {
        content
            .opacity(appeared ? 1 : 0)
            .offset(y: appeared ? 0 : 16)
            .onAppear {
                withAnimation(.easeOut(duration: 0.5).delay(delay)) {
                    appeared = true
                }
            }
    }
}

extension View {
    func slideUpFade(delay: Double = 0) -> some View {
        modifier(SlideUpFade(delay: delay))
    }
}
