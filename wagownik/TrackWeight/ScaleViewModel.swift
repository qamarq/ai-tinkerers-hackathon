//
//  ScaleViewModel.swift
//  TrackWeight
//

import OpenMultitouchSupport
import SwiftUI
import Combine

@MainActor
final class ScaleViewModel: ObservableObject {
    @Published var currentWeight: Float = 0.0
    @Published var zeroOffset: Float = 0.0
    @Published var isListening = false
    @Published var hasTouch = false
    @Published var pendingMeasurementId: Int? = nil
    @Published var isSubmitting = false
    @Published var submitSuccess = false

    private let manager = OMSManager.shared
    private let api = ScaleAPIService.shared
    private var task: Task<Void, Never>?
    private var pollingTask: Task<Void, Never>?
    private var rawWeight: Float = 0.0

    func startListening() {
        if manager.startListening() {
            isListening = true
        }

        task = Task { [weak self, manager] in
            for await touchData in manager.touchDataStream {
                await MainActor.run {
                    self?.processTouchData(touchData)
                }
            }
        }

        startPolling()
    }

    func stopListening() {
        task?.cancel()
        pollingTask?.cancel()
        if manager.stopListening() {
            isListening = false
            hasTouch = false
            currentWeight = 0.0
        }
    }

    func zeroScale() {
        if hasTouch {
            zeroOffset = rawWeight
        }
    }

    func submitWeight() {
        guard let id = pendingMeasurementId, !isSubmitting else { return }
        isSubmitting = true
        submitSuccess = false

        Task { [weak self] in
            guard let self else { return }
            do {
                let weight = self.currentWeight
                _ = try await self.api.submitWeight(id: id, weight: weight)
                await MainActor.run {
                    self.pendingMeasurementId = nil
                    self.isSubmitting = false
                    self.submitSuccess = true
                }
                // Reset success after 2 seconds
                try? await Task.sleep(nanoseconds: 2_000_000_000)
                await MainActor.run {
                    self.submitSuccess = false
                }
            } catch {
                print("Failed to submit weight: \(error)")
                await MainActor.run {
                    self.isSubmitting = false
                }
            }
        }
    }

    private func startPolling() {
        pollingTask = Task { [weak self] in
            while !Task.isCancelled {
                do {
                    let response = try await self?.api.checkShouldWeigh()
                    await MainActor.run {
                        if let response, response.shouldWeigh, let measurement = response.measurement {
                            self?.pendingMeasurementId = measurement.id
                            // Bring app to front
                            NSApplication.shared.activate(ignoringOtherApps: true)
                            NSApplication.shared.windows.first?.makeKeyAndOrderFront(nil)
                        } else if response?.shouldWeigh == false {
                            self?.pendingMeasurementId = nil
                        }
                    }
                } catch {
                    // Silently retry on network errors
                }
                try? await Task.sleep(nanoseconds: 1_000_000_000) // 1 second
            }
        }
    }

    private func processTouchData(_ touchData: [OMSTouchData]) {
        if touchData.isEmpty {
            hasTouch = false
            currentWeight = 0.0
            zeroOffset = 0.0  // Reset zero when finger is lifted
        } else {
            hasTouch = true
            rawWeight = touchData.first?.pressure ?? 0.0
            currentWeight = max(0, rawWeight - zeroOffset)
        }
    }

    deinit {
        task?.cancel()
        pollingTask?.cancel()
        manager.stopListening()
    }
}