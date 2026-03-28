//
//  HomeView.swift
//  TrackWeight
//

import SwiftUI

struct HomeView: View {
    let onBegin: () -> Void
    @State private var logoScale: CGFloat = 0.8
    @State private var logoOpacity: Double = 0

    var body: some View {
        VStack(spacing: 0) {
            Spacer()

            VStack(spacing: 32) {
                // Logo mark
                ZStack {
                    Circle()
                        .fill(Color.gotownikPrimary.opacity(0.08))
                        .frame(width: 140, height: 140)

                    Circle()
                        .fill(Color.gotownikPrimary.opacity(0.05))
                        .frame(width: 180, height: 180)

                    Image(systemName: "scalemass")
                        .font(.system(size: 56, weight: .thin))
                        .foregroundStyle(Color.gotownikPrimary)
                }
                .scaleEffect(logoScale)
                .opacity(logoOpacity)
                .onAppear {
                    withAnimation(.spring(response: 0.8, dampingFraction: 0.7).delay(0.1)) {
                        logoScale = 1.0
                        logoOpacity = 1.0
                    }
                }

                // Title
                VStack(spacing: 10) {
                    Text("Gotownik")
                        .font(.system(size: 42, weight: .bold, design: .rounded))
                        .foregroundStyle(Color.primary)
                        .slideUpFade(delay: 0.2)

                    Text("Precision trackpad scale")
                        .font(.system(size: 16, weight: .medium))
                        .foregroundStyle(Color.gotownikMutedForeground)
                        .slideUpFade(delay: 0.3)
                }
            }

            Spacer()

            // CTA
            VStack(spacing: 16) {
                Button(action: onBegin) {
                    HStack(spacing: 8) {
                        Text("Get Started")
                        Image(systemName: "arrow.right")
                            .font(.system(size: 13, weight: .semibold))
                    }
                }
                .buttonStyle(GotownikButtonStyle(size: .large))

                Text("Place objects on your trackpad to weigh them")
                    .font(.system(size: 13, weight: .medium))
                    .foregroundStyle(Color.gotownikMutedForeground)
            }
            .slideUpFade(delay: 0.5)
            .padding(.bottom, 48)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}

#Preview {
    HomeView(onBegin: {})
}
