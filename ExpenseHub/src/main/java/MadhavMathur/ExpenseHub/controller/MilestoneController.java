package MadhavMathur.ExpenseHub.controller;

import MadhavMathur.ExpenseHub.dto.MilestoneDTO;
import MadhavMathur.ExpenseHub.entity.ProfileEntity;
import MadhavMathur.ExpenseHub.repository.ProfileRepository;
import MadhavMathur.ExpenseHub.service.MilestoneService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/milestones")
@RequiredArgsConstructor
public class MilestoneController {

    private final MilestoneService milestoneService;
    private final ProfileRepository profileRepository;

    // GET /api/milestones
    @GetMapping
    public ResponseEntity<List<MilestoneDTO>> list(Principal principal) {
        ProfileEntity profile = getProfile(principal);
        return ResponseEntity.ok(milestoneService.getMilestones(profile.getId()));
    }

    // POST /api/milestones
    @PostMapping
    public ResponseEntity<MilestoneDTO> create(@RequestBody MilestoneDTO dto, Principal principal) {
        ProfileEntity profile = getProfile(principal);
        MilestoneDTO created = milestoneService.create(dto, profile);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // PUT /api/milestones/{id}
    @PutMapping("/{id}")
    public ResponseEntity<MilestoneDTO> update(
            @PathVariable Long id,
            @RequestBody MilestoneDTO dto,
            Principal principal) {
        ProfileEntity profile = getProfile(principal);
        MilestoneDTO updated = milestoneService.update(id, dto, profile.getId());
        return ResponseEntity.ok(updated);
    }

    // DELETE /api/milestones/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, Principal principal) {
        ProfileEntity profile = getProfile(principal);
        milestoneService.delete(id, profile.getId());
        return ResponseEntity.noContent().build();
    }

    // ── Helper ──────────────────────────────────────────────────────────────
    private ProfileEntity getProfile(Principal principal) {
        return profileRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new IllegalArgumentException("Profile not found"));
    }
}
