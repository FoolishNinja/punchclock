package ch.zli.m223.punchclock.service;

import ch.zli.m223.punchclock.domain.BackgroundColor;
import ch.zli.m223.punchclock.repository.BackgroundColorRepository;
import org.jvnet.hk2.annotations.Service;

import java.util.Optional;

@Service
public class BackgroundColorService {
    private BackgroundColorRepository backgroundColorRepository;

    public BackgroundColorService(BackgroundColorRepository backgroundColorRepository) {
        this.backgroundColorRepository = backgroundColorRepository;
    }

    public Optional<BackgroundColor> getBackgroundColor() {
        return backgroundColorRepository.findById(1L);
    }

    public BackgroundColor updateBackgroundColor(BackgroundColor BackgroundColor) {
        return backgroundColorRepository.save(BackgroundColor);
    }
}
